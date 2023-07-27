import { useState } from "react";
import { ActivityIndicator, Linking, SafeAreaView, StyleProp, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Center, FullscreenModal, ToolButton } from "../components";
import t from "../i18n";

interface SplatNetViewProps {
  path?: string;
  lang: string;
  style?: StyleProp<ViewStyle>;
  onGetWebServiceToken: () => Promise<string>;
}

const SplatNetView = (props: SplatNetViewProps) => {
  const [loading, setLoading] = useState(false);
  const [webServiceToken, setWebServiceToken] = useState("");

  const onWebViewPress = async () => {
    setLoading(true);
    const webServiceToken = await props.onGetWebServiceToken();
    setWebServiceToken(webServiceToken);
    setLoading(false);
  };
  const onMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "close") {
      setWebServiceToken("");
    } else if (event.nativeEvent.data === "error") {
      setWebServiceToken("");
      Linking.openURL(`com.nintendo.znca://znca/game/4834290508791808?p=${props.path ?? "/"}`);
    }
  };

  return (
    <Center style={props.style}>
      <ToolButton
        isLoading={loading}
        icon="donut"
        title={t("splatnet_3")}
        onPress={onWebViewPress}
      />
      <FullscreenModal isVisible={webServiceToken.length > 0}>
        <SafeAreaView
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            bottom: 0,
            backgroundColor: "black",
          }}
        >
          {webServiceToken.length > 0 && (
            // TODO: audit injected scripts and third-party cookies usage.
            <WebView
              source={{
                uri: `https://api.lp1.av5ja.srv.nintendo.net${props.path ?? "/"}?lang=${
                  props.lang
                }`,
                headers: {
                  Cookie: `_gtoken=${webServiceToken}`,
                  "X-Web-View-Ver": "4.0.0-d5178440",
                },
              }}
              injectedJavaScript={`
                document.cookie = "_gtoken=${webServiceToken}";
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
                document.cookie = "_gtoken=${webServiceToken}";
                true;
              `}
              onMessage={onMessage}
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
