import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Linking } from "react-native";
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
    const dir = FileSystem.cacheDirectory + "conch-bay-export";
    const uri = FileSystem.cacheDirectory + "conch-bay-export.zip";
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${dir}/battles`, { intermediates: true });
    let lastTime = 0;
    let duplicate = 0;
    for await (const row of Database.queryDetailEach({
      modes: ["salmon_run"],
      inverted: true,
    })) {
      const time = row.time / 1000;
      if (time == lastTime) {
        duplicate++;
      } else {
        duplicate = 0;
      }
      lastTime = time;
      await FileSystem.writeAsStringAsync(
        `${dir}/battles/${time}${duplicate ? `-${duplicate}` : ""}.json`,
        row.detail
      );
    }
    await FileSystem.makeDirectoryAsync(`${dir}/coops`, { intermediates: true });
    lastTime = 0;
    duplicate = 0;
    for await (const row of Database.queryDetailEach({ modes: ["salmon_run"] })) {
      const time = row.time / 1000;
      if (time == lastTime) {
        duplicate++;
      } else {
        duplicate = 0;
      }
      lastTime = time;
      await FileSystem.writeAsStringAsync(
        `${dir}/coops/${time}${duplicate ? `-${duplicate}` : ""}.json`,
        row.detail
      );
    }
    await zip(dir, uri);

    await Sharing.shareAsync(uri, { UTI: "public.zip-archive" });

    // Clean up.
    await Promise.all([
      FileSystem.deleteAsync(uri, { idempotent: true }),
      FileSystem.deleteAsync(dir, { idempotent: true }),
    ]);
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
