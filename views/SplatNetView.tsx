import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { ActivityIndicator, Share, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Center, FullscreenModal, ToolButton, ViewStyles } from "../components";
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
    } else if (event.nativeEvent.data.startsWith("share:")) {
      const obj = JSON.parse(event.nativeEvent.data.replace("share:", ""));
      Share.share({ url: obj["image_url"], message: obj["text"] });
    } else if (event.nativeEvent.data.startsWith("url:")) {
      const obj = JSON.parse(event.nativeEvent.data.replace("url:", ""));
      Share.share({ url: obj["url"], message: obj["text"] });
    } else if (event.nativeEvent.data.startsWith("copy:")) {
      Clipboard.setStringAsync(event.nativeEvent.data.replace("copy:", ""));
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
          style={[
            ViewStyles.ff,
            {
              position: "absolute",
              bottom: 0,
            },
          ]}
        >
          <SafeAreaView
            style={[
              ViewStyles.ff,
              {
                position: "absolute",
                bottom: 0,
                backgroundColor: "black",
              },
            ]}
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
                window.invokeNativeShare = function(s) {
                  window.ReactNativeWebView.postMessage("share:" + s);
                }
                window.invokeNativeShareUrl = function(s) {
                  window.ReactNativeWebView.postMessage("url:" + s);
                }
                window.copyToClipboard = function(s) {
                  window.ReactNativeWebView.postMessage("copy:" + s);
                }
                window.requestGameWebToken = function() {
                  Promise.resolve().then(() => window.onGameWebTokenReceive?.call(null, "${webServiceToken}"));
                };
                true;
              `}
                onMessage={onMessage}
                renderLoading={() => (
                  <Center style={[ViewStyles.ff, { backgroundColor: "#292e35" }]}>
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
