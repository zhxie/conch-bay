import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Sharing from "expo-sharing";
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

interface ErrorViewProps {
  error: Error;
}

const ErrorView = (props: ErrorViewProps) => {
  const theme = useTheme();

  const onCreateAGithubIssuePress = () => {
    Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
  };
  const onSendAMailPress = async () => {
    if (await MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ["conch-bay@outlook.com"],
      });
    } else {
      Linking.openURL("mailto:conch-bay@outlook.com");
    }
  };
  const onExportDatabasePress = async () => {
    const uri = FileSystem.documentDirectory + "SQLite/conch-bay.db";
    await Sharing.shareAsync(uri, { UTI: "public.database" });
  };

  return (
    <Center style={[ViewStyles.p4, { width: "100%", height: "100%" }]}>
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
        <Text style={ViewStyles.mb4}>{props.error.toString()}</Text>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCreateAGithubIssuePress}>
          <Marquee style={theme.reverseTextStyle}>{t("create_a_github_issue")}</Marquee>
        </Button>
        <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onSendAMailPress}>
          <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
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
