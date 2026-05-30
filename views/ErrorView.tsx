import * as Application from "expo-application";
import { Directory, File, Paths } from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Linking, Platform } from "react-native";
import { zip } from "react-native-zip-archive";
import {
  Button,
  Center,
  Marquee,
  Text,
  TextStyles,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import * as Database from "../utils/database";

interface ErrorViewProps {
  error: Error;
}

const ErrorView = (props: ErrorViewProps) => {
  const theme = useTheme();

  const [exporting, setExporting] = useState(false);

  const onSendAnEmailPress = async () => {
    if (await MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ["conch-bay@outlook.com"],
        subject: t("error_report"),
        body: `> ${t("error_description")}


        > ${t("version")}
        ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})

        > ${t("error_information")}
        ${props.error.stack}
        `,
      });
    } else {
      Linking.openURL("mailto:conch-bay@outlook.com");
    }
  };
  const onJoinDiscordServerPress = () => {
    Linking.openURL("https://discord.gg/JfZJ6xzRZC");
  };
  const onJoinTheBetaVersionPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/Join-the-Beta-Version");
  };
  const onExportResultsPress = async () => {
    setExporting(true);
    // TODO: reuse export codes.
    const dir = new Directory(Paths.cache, "conch-bay-export");
    const archive = new File(Paths.cache, "conch-bay-export.zip");
    const battlesDir = new Directory(dir, "battles");
    const coopsDir = new Directory(dir, "coops");
    battlesDir.create({ intermediates: true, idempotent: true });
    coopsDir.create({ intermediates: true, idempotent: true });
    const battleDuplicate = new Map<number, number>();
    const coopDuplicate = new Map<number, number>();
    for await (const row of Database.queryDetailEach()) {
      const time = row.time / 1000;
      if (row.mode === "salmon_run") {
        const sequence = (coopDuplicate.get(time) ?? 0) + 1;
        coopDuplicate.set(time, sequence);
        const file = new File(coopsDir, `${time}${sequence ? `-${sequence}` : ""}.json`);
        file.create({ intermediates: true, overwrite: true });
        file.write(row.detail);
      } else {
        const sequence = (battleDuplicate.get(time) ?? 0) + 1;
        battleDuplicate.set(time, sequence);
        const file = new File(battlesDir, `${time}${sequence > 1 ? `-${sequence}` : ""}.json`);
        file.create({ intermediates: true, overwrite: true });
        file.write(row.detail);
      }
    }
    await zip(dir.uri, archive.uri);

    await Sharing.shareAsync(archive.uri, { UTI: "public.zip-archive" });

    // Clean up.
    if (archive.exists) {
      archive.delete();
    }
    if (dir.exists) {
      dir.delete();
    }
    setExporting(false);
  };
  const onExportDatabasePress = async () => {
    const database = new File(Paths.document, "SQLite", "conch-bay.db");
    await Sharing.shareAsync(database.uri, { UTI: "public.database" });
  };

  return (
    <Center style={[ViewStyles.p4, ViewStyles.ff]}>
      <VStack>
        <Text style={[TextStyles.h0, ViewStyles.mb2]}>{t("sorry")}</Text>
        <Text style={[TextStyles.h15, ViewStyles.mb2]}>{t("sorry_notice")}</Text>
        <Text style={ViewStyles.mb4}>{props.error.message}</Text>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onSendAnEmailPress}>
          <Marquee style={theme.reverseTextStyle}>{t("send_an_email")}</Marquee>
        </Button>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onJoinDiscordServerPress}>
          <Marquee style={theme.reverseTextStyle}>{t("join_discord_server")}</Marquee>
        </Button>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onJoinTheBetaVersionPress}>
          <Marquee style={theme.reverseTextStyle}>{t("join_the_beta_version")}</Marquee>
        </Button>
        <Button
          loading={exporting}
          loadingText={t("exporting")}
          style={[ViewStyles.mb2, ViewStyles.accent]}
          textStyle={theme.reverseTextStyle}
          onPress={onExportResultsPress}
        >
          <Marquee style={theme.reverseTextStyle}>{t("export_results")}</Marquee>
        </Button>
        <Button style={[ViewStyles.mb4, ViewStyles.accent]} onPress={onExportDatabasePress}>
          <Marquee style={theme.reverseTextStyle}>{t("export_database")}</Marquee>
        </Button>
        <Text center style={TextStyles.subtle}>{`${t(
          Platform.OS === "ios" ? "CFBundleDisplayName" : "app_name",
          {
            // HACK: cannot trust Application.applicationName in iOS since it will not
            // return localized application name.
            defaultValue: Application.applicationName,
          },
        )} ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}</Text>
      </VStack>
    </Center>
  );
};

export default ErrorView;
