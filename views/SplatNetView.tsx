import { useState } from "react";
import { ActivityIndicator, Linking, SafeAreaView, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { Center, FullscreenModal, ToolButton } from "../components";
import t from "../i18n";

interface SplatNetViewProps {
  webServiceToken: string;
  lang: string;
  style?: StyleProp<ViewStyle>;
}

const SplatNetView = (props: SplatNetViewProps) => {
  const [net, setNet] = useState(false);

  const onNetPress = () => {
    setNet(true);
  };

  return (
    <Center style={props.style}>
      <ToolButton icon="donut" title={t("splatnet")} onPress={onNetPress} />
      <FullscreenModal isVisible={net}>
        <SafeAreaView
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            bottom: 0,
            backgroundColor: "black",
          }}
        >
          {net && (
            <WebView
              source={{
                uri: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${props.lang}`,
                headers: {
                  Cookie: `_gtoken=${props.webServiceToken}`,
                  "X-Web-View-Ver": "4.0.0-d5178440",
                },
              }}
              injectedJavaScript={`
                document.cookie = "_gtoken=${props.webServiceToken}";
                window.closeWebView = function() {
                  window.ReactNativeWebView.postMessage("close");
                };
                setInterval(function() {
                  if (document.querySelector('[class*="ErrorPage_ErrorPage"]')) {
                    window.ReactNativeWebView.postMessage("error");
                  }
                }, 1000);
                true;
              `}
              injectedJavaScriptBeforeContentLoaded={`
                document.cookie = "_gtoken=${props.webServiceToken}";
                true;
              `}
              onMessage={(event) => {
                if (event.nativeEvent.data === "close") {
                  setNet(false);
                } else if (event.nativeEvent.data === "error") {
                  setNet(false);
                  Linking.openURL("com.nintendo.znca://znca/game/4834290508791808");
                }
              }}
              renderLoading={() => (
                <Center style={[{ width: "100%", height: "100%", backgroundColor: "#292e35" }]}>
                  <ActivityIndicator />
                </Center>
              )}
              startInLoadingState
              thirdPartyCookiesEnabled
              style={{ backgroundColor: "#292e35" }}
            />
          )}
        </SafeAreaView>
      </FullscreenModal>
    </Center>
  );
};

export default SplatNetView;
