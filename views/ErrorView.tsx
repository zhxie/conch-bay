import * as Application from "expo-application";
import Constants, { AppOwnership } from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Linking } from "react-native";
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

  const onCreateAGithubIssuePress = () => {
    Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
  };
  const onSendAMailPress = async () => {
    if (await MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ["conch-bay@outlook.com"],
        subject: t("error_report"),
        body: `> ${t("error_description")}


        > ${t("version")}
        ${Application.applicationName} ${Application.nativeApplicationVersion} (${
          Application.nativeBuildVersion
        })

        > ${t("error_information")}
        ${props.error.stack}
        `,
      });
    } else {
      Linking.openURL("mailto:conch-bay@outlook.com");
    }
  };
  const onExportResultsPress = async () => {
    setExporting(true);
    // TODO: reuse export codes.
    const uri = FileSystem.cacheDirectory + `conch-bay-export.json`;
    if (Constants.appOwnership === AppOwnership.Expo) {
      let battles = "";
      let coops = "";
      for await (const row of Database.queryDetailEach()) {
        if (row.mode === "salmon_run") {
          coops += `${row.detail},`;
        } else {
          battles += `${row.detail},`;
        }
      }

      if (battles.endsWith(",")) {
        battles = battles.substring(0, battles.length - 1);
      }
      if (coops.endsWith(",")) {
        coops = coops.substring(0, coops.length - 1);
      }
      await FileSystem.writeAsStringAsync(uri, `{"battles":[${battles}],"coops":[${coops}]}`, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // HACK: dynamic import the library.
      const FileAccess = await import("react-native-file-access");
      // Export battles.
      await FileSystem.writeAsStringAsync(uri, '{"battles":[', {
        encoding: FileSystem.EncodingType.UTF8,
      });
      let battleStarted = false;
      for await (const row of Database.queryDetailEach({
        modes: ["salmon_run"],
        inverted: true,
      })) {
        if (!battleStarted) {
          await FileAccess.FileSystem.appendFile(uri, row.detail, "utf8");
          battleStarted = true;
        } else {
          await FileAccess.FileSystem.appendFile(uri, `,${row.detail}`, "utf8");
        }
      }
      // Export coops.
      await FileAccess.FileSystem.appendFile(uri, '],"coops":[', "utf8");
      let coopStarted = false;
      for await (const row of Database.queryDetailEach({ modes: ["salmon_run"] })) {
        if (!coopStarted) {
          await FileAccess.FileSystem.appendFile(uri, row.detail, "utf8");
          coopStarted = true;
        } else {
          await FileAccess.FileSystem.appendFile(uri, `,${row.detail}`, "utf8");
        }
      }
      await FileAccess.FileSystem.appendFile(uri, "]}", "utf8");
    }

    await Sharing.shareAsync(uri, { UTI: "public.json" });

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    setExporting(false);
  };
  const onExportDatabasePress = async () => {
    const uri = FileSystem.documentDirectory + "SQLite/conch-bay.db";
    await Sharing.shareAsync(uri, { UTI: "public.database" });
  };

  return (
    <Center style={[ViewStyles.p4, ViewStyles.ff]}>
      <VStack>
        <Text
          style={[
            ViewStyles.mb2,
            TextStyles.b,
            {
              fontSize: 40,
            },
          ]}
        >
          {t("sorry")}
        </Text>
        <Text
          style={[
            ViewStyles.mb2,
            {
              fontSize: 18,
            },
          ]}
        >
          {t("sorry_notice")}
        </Text>
        <Text style={ViewStyles.mb4}>{props.error.message}</Text>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCreateAGithubIssuePress}>
          <Marquee style={theme.reverseTextStyle}>{t("create_a_github_issue")}</Marquee>
        </Button>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onSendAMailPress}>
          <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
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
        <Text
          center
          style={TextStyles.subtle}
        >{`${Application.applicationName} ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}</Text>
      </VStack>
    </Center>
  );
};

export default ErrorView;
