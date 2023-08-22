import { useState } from "react";
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Center, FullscreenModal, ToolButton } from "../components";
import t from "../i18n";

interface SplatNetViewProps {
  lang: string;
  style?: StyleProp<ViewStyle>;
  onGetWebServiceToken: () => Promise<string>;
}

const SplatNetView = (props: SplatNetViewProps) => {
  const [loading, setLoading] = useState(false);
  const [webView, setWebView] = useState(false);
  const [webServiceToken, setWebServiceToken] = useState("");

  const onWebViewPress = async () => {
    setLoading(true);
    const webServiceToken = await props.onGetWebServiceToken();
    if (webServiceToken.length > 0) {
      setWebView(true);
      setWebServiceToken(webServiceToken);
    }
    setLoading(false);
  };
  const onModalHide = () => {
    setWebServiceToken("");
  };
  const onMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "close") {
      setWebView(false);
    }
  };

  return (
    <Center style={props.style}>
      <ToolButton loading={loading} icon="donut" title={t("splatnet_3")} onPress={onWebViewPress} />
      {loading && (
        <WebView
          source={{ uri: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${props.lang}` }}
          style={{ width: 0, height: 0 }}
        />
      )}
      <FullscreenModal isVisible={webView} onModalHide={onModalHide}>
        <SafeAreaProvider
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
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
              <WebView
                source={{
                  uri: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${props.lang}`,
                }}
                injectedJavaScript={`
                window.closeWebView = function() {
                  window.ReactNativeWebView.postMessage("close");
                };
                window.requestGameWebToken = function() {
                  Promise.resolve().then(() => window.onGameWebTokenReceive?.call(null, "${webServiceToken}"));
                };
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
        </SafeAreaProvider>
      </FullscreenModal>
    </Center>
  );
};

export default SplatNetView;
