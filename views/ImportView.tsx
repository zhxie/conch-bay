import { Buffer } from "buffer";
import * as Device from "expo-device";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  BannerLevel,
  Button,
  Center,
  Color,
  Dialog,
  Marquee,
  Modal,
  ToolButton,
  ViewStyles,
  useBanner,
  useTheme,
} from "../components";
import t from "../i18n";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import { decode64 } from "../utils/codec";

const IMPORT_READ_SIZE = Math.floor((Device.totalMemory! / 1024) * 15);

enum ImportStreamMode {
  Unknown,
  Battles = '"battles":[',
  Coops = '"coops":[',
}

class ImportStreamParser {
  mode = ImportStreamMode.Unknown;
  drained = 0;
  buffer: number[] = [];

  parse = (bytes: Uint8Array) => {
    // For prefix position.
    let battlesPrefix = 0,
      coopsPrefix = 0;
    // For result parsing.
    let bracket = 0,
      quote = false;
    let bracketPos = -1;
    const battles: number[] = [],
      coops: number[] = [];

    let drainable = 0;
    // HACK: avoid spread syntax which may cause stack oversize.
    for (const byte of bytes) {
      this.buffer.push(byte);
    }
    for (let i = 0; i < this.buffer.length; i++) {
      // No null is allowed.
      if (this.buffer[i] === 0) {
        throw new Error(`null character found at ${this.drained + i}`);
      }

      // Escape \ and its following character, which should be an ASCII character.
      if (this.buffer[i] === "\\".charCodeAt(0)) {
        i++;
        continue;
      }
      // Escape space, \r and \n.
      if (
        this.buffer[i] === " ".charCodeAt(0) ||
        this.buffer[i] === "\r".charCodeAt(0) ||
        this.buffer[i] === "\n".charCodeAt(0)
      ) {
        continue;
      }

      // Guess which mode is reading from.
      if (this.buffer[i] === ImportStreamMode.Battles.charCodeAt(battlesPrefix)) {
        battlesPrefix += 1;
      } else {
        battlesPrefix = 0;
      }
      if (this.buffer[i] === ImportStreamMode.Coops.charCodeAt(coopsPrefix)) {
        coopsPrefix += 1;
      } else {
        coopsPrefix = 0;
      }
      if (battlesPrefix === ImportStreamMode.Battles.length) {
        this.mode = ImportStreamMode.Battles;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      } else if (coopsPrefix === ImportStreamMode.Coops.length) {
        this.mode = ImportStreamMode.Coops;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      }

      // Parse results.
      switch (this.mode) {
        case ImportStreamMode.Unknown:
          break;
        case ImportStreamMode.Battles:
        case ImportStreamMode.Coops:
          if (this.buffer[i] === '"'.charCodeAt(0)) {
            quote = !quote;
          }
          if (!quote) {
            if (this.buffer[i] === "{".charCodeAt(0)) {
              if (bracket === 0) {
                bracketPos = i;
              }
              bracket += 1;
            }
            if (this.buffer[i] === "}".charCodeAt(0)) {
              bracket -= 1;
              if (bracket === 0) {
                const result = this.buffer.slice(bracketPos, i + 1);
                switch (this.mode) {
                  case ImportStreamMode.Battles:
                    battles.push(",".charCodeAt(0));
                    for (const byte of result) {
                      battles.push(byte);
                    }
                    break;
                  case ImportStreamMode.Coops:
                    coops.push(",".charCodeAt(0));
                    for (const byte of result) {
                      coops.push(byte);
                    }
                    break;
                }
                drainable = i + 1;
              }
            }
          }
          break;
      }
    }
    this.buffer.splice(0, drainable);
    this.drained += drainable;

    if (battles.length === 0) {
      battles.push("[".charCodeAt(0));
    } else {
      battles[0] = "[".charCodeAt(0);
    }
    battles.push("]".charCodeAt(0));
    if (coops.length === 0) {
      coops.push("[".charCodeAt(0));
    } else {
      coops[0] = "[".charCodeAt(0);
    }
    coops.push("]".charCodeAt(0));
    return {
      battles: JSON.parse(Buffer.from(battles).toString()),
      coops: JSON.parse(Buffer.from(coops).toString()),
    };
  };
}

interface ImportResult {
  skip: number;
  fail: number;
  error?: Error;
}
interface ImportViewProps {
  disabled: boolean;
  style?: StyleProp<ViewStyle>;
  onBegin: () => void;
  onResults: (
    battles: VsHistoryDetailResult[],
    coops: CoopHistoryDetailResult[]
  ) => Promise<ImportResult>;
  onComplete: (n: number) => void;
}

const ImportView = (props: ImportViewProps) => {
  const theme = useTheme();

  const showBanner = useBanner();

  const [import_, setImport] = useState(false);
  const [uri, setUri] = useState("");
  const [importing, setImporting] = useState(false);

  const showResultBanner = (n: number, skip: number, fail: number, error?: Error) => {
    if (fail > 0 && skip > 0) {
      showBanner(
        BannerLevel.Warn,
        t("loaded_n_results_skip_skipped_fail_failed", { n, skip, fail, error })
      );
    } else if (fail > 0) {
      showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail, error }));
    } else if (skip > 0) {
      showBanner(BannerLevel.Success, t("loaded_n_results_skip_skipped", { n, skip }));
    } else {
      showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
    }
  };

  const importDirectly = async (uri: string) => {
    let imported = 0;
    try {
      props.onBegin();
      const results = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = results["battles"].length + results["coops"].length;
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      const { skip, fail, error } = await props.onResults(results["battles"], results["coops"]);
      showResultBanner(n, skip, fail, error);
      imported = n - fail - skip;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      imported = -1;
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };
  const splitAndImport = async (uri: string) => {
    let imported = 0;
    try {
      props.onBegin();
      const parser = new ImportStreamParser();
      let n = 0,
        skip = 0,
        fail = 0;
      let error: Error | undefined;
      let batch = 0;
      while (true) {
        const encoded = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
          length: IMPORT_READ_SIZE,
          position: IMPORT_READ_SIZE * batch,
        });
        const text = decode64(encoded);
        const results = parser.parse(text);
        n += results.battles.length + results.coops.length;
        const result = await props.onResults(results.battles, results.coops);
        skip += result.skip;
        fail += result.fail;
        if (!error && result.error) {
          error = result.error;
        }

        if (text.length < IMPORT_READ_SIZE) {
          break;
        }
        batch += 1;
      }
      showResultBanner(n, skip, fail, error);
      imported = n - skip - fail;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      imported = -1;
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };

  const onImportPress = () => {
    setImport(true);
  };
  const onImportClose = () => {
    if (!importing) {
      setImport(false);
    }
  };
  const onConvertS3sOutputsPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-s3s");
  };
  const onConvertStatInkSalmonRunJsonPress = () => {
    WebBrowser.openBrowserAsync(
      "https://github.com/zhxie/conch-bay#import-salmon-run-data-from-statink"
    );
  };
  const onConvertIkawidget3Ikax3Press = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-ikawidget3");
  };
  const onConvertSalmdroidnwBackupPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-salmdroidnw");
  };
  const onConvertSalmonia3PlusBackupPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-salmonia3");
  };
  const onImportContinuePress = async () => {
    setImporting(true);
    let uri = "";
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.canceled) {
        setImporting(false);
        return;
      }
      uri = doc.assets[0].uri;
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      if (info["size"] > IMPORT_READ_SIZE) {
        setUri(uri);
      } else {
        importDirectly(uri);
      }
      return;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    setImporting(false);
  };
  const onImportContinueContinuePress = () => {
    setUri("");
    importDirectly(uri);
  };
  const onSplitAndImportPress = () => {
    setUri("");
    splitAndImport(uri);
  };

  return (
    <Center style={props.style}>
      <ToolButton
        icon="download"
        title={t("import")}
        style={ViewStyles.mr2}
        onPress={onImportPress}
      />
      <Modal isVisible={import_} onClose={onImportClose} style={ViewStyles.modal1d}>
        <Dialog icon="download" text={t("import_notice")}>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertS3sOutputsPress}
          >
            <Marquee>{t("convert_s3s_outputs")}</Marquee>
          </Button>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertStatInkSalmonRunJsonPress}
          >
            <Marquee>{t("convert_stat_ink_salmon_run_json")}</Marquee>
          </Button>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertIkawidget3Ikax3Press}
          >
            <Marquee>{t("convert_ikawidget3_ikax3")}</Marquee>
          </Button>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertSalmdroidnwBackupPress}
          >
            <Marquee>{t("convert_salmdroidnw_backup")}</Marquee>
          </Button>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertSalmonia3PlusBackupPress}
          >
            <Marquee>{t("convert_salmonia3+_backup")}</Marquee>
          </Button>
          <Button
            disabled={props.disabled && !importing}
            loading={importing}
            loadingText={t("importing")}
            style={ViewStyles.accent}
            textStyle={theme.reverseTextStyle}
            onPress={onImportContinuePress}
          >
            <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
          </Button>
        </Dialog>
        <Modal isVisible={uri.length > 0} style={ViewStyles.modal1d}>
          <Dialog icon="alert-circle" text={t("split_and_import_notice")}>
            <Button
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onImportContinueContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
            <Button
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onSplitAndImportPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("split_and_import")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
      </Modal>
    </Center>
  );
};

export default ImportView;
