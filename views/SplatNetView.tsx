import * as Clipboard from "expo-clipboard";
import { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react";
import { ActivityIndicator, Platform, Share, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Center, FullscreenModal, ToolButton, ViewStyles } from "../components";
import t from "../i18n";
import { WebServiceToken } from "../utils/api";

interface SplatNetViewRef {
  open: () => void;
}
interface SplatNetViewProps {
  disabled?: boolean;
  lang: string;
  style?: StyleProp<ViewStyle>;
  onGetWebServiceToken: () => Promise<WebServiceToken | undefined>;
}

const SplatNetView = (props: SplatNetViewProps, ref: ForwardedRef<SplatNetViewRef>) => {
  useImperativeHandle(
    ref,
    () => ({
      open: onWebViewPress,
    }),
    []
  );

  const [webView, setWebView] = useState(false);
  const [webServiceToken, setWebServiceToken] = useState<WebServiceToken>();

  const onWebViewPress = async () => {
    setWebView(true);
    const webServiceToken = await props.onGetWebServiceToken();
    if (webServiceToken) {
      setWebServiceToken(webServiceToken);
    } else {
      setWebView(false);
    }
  };
  const onDismiss = () => {
    setWebServiceToken(undefined);
  };
  const onMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "close") {
      setWebView(false);
    } else if (event.nativeEvent.data.startsWith("share:")) {
      const obj = JSON.parse(event.nativeEvent.data.replace("share:", ""));
      Share.share({
        url: obj["image_url"],
        message: Platform.OS === "android" ? obj["image_url"] : obj["text"],
      });
    } else if (event.nativeEvent.data.startsWith("url:")) {
      const obj = JSON.parse(event.nativeEvent.data.replace("url:", ""));
      Share.share({
        url: obj["url"],
        message: Platform.OS === "android" ? obj["url"] : obj["text"],
      });
    } else if (event.nativeEvent.data.startsWith("copy:")) {
      Clipboard.setStringAsync(event.nativeEvent.data.replace("copy:", ""));
    } else if (event.nativeEvent.data.startsWith("images:")) {
      const obj = JSON.parse(event.nativeEvent.data.replace("images:", ""));
      for (const url of obj["image_urls"]) {
        Share.share({ url, message: url });
      }
    }
  };

  return (
    <Center style={props.style}>
      <ToolButton
        disabled={props.disabled}
        icon="donut"
        title={t("splatnet_3")}
        onPress={onWebViewPress}
      />
      <FullscreenModal isVisible={webView} onDismiss={onDismiss}>
        <SafeAreaView
          style={[
            ViewStyles.f,
            {
              backgroundColor: "black",
            },
          ]}
        >
          {!webServiceToken && (
            <Center style={[ViewStyles.f, { backgroundColor: "#292e35" }]}>
              <ActivityIndicator />
            </Center>
          )}
          {webServiceToken && (
            <WebView
              source={{
                uri: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${props.lang}&na_country=${webServiceToken.country}&na_lang=${webServiceToken.language}`,
                headers: {
                  Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                  "Accept-Encoding": "gzip, deflate",
                  "Accept-Language": `${props.lang};q=0.9`,
                  DNT: 1,
                  "Sec-Fetch-Dest": "document",
                  "Sec-Fetch-Mode": "navigate",
                  "Sec-Fetch-Site": "none",
                  "Sec-Fetch-User": "?1",
                  "Upgrade-Insecure-Requests": 1,
                  "User-Agent":
                    "Mozilla/5.0 (Linux; Android 11; sdk_gphone_arm64 Build/RSR1.210722.013.A6; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36",
                  "X-AppColorScheme": "LIGHT",
                  "X-GameWebToken": webServiceToken.accessToken,
                  "X-Requested-With": "com.nintendo.znca",
                },
              }}
              injectedJavaScript={`
              window.closeWebView = function() {
                window.ReactNativeWebView.postMessage("close");
              };
              window.invokeNativeShare = function(s) {
                window.ReactNativeWebView.postMessage("share:" + s);
              };
              window.invokeNativeShareUrl = function(s) {
                window.ReactNativeWebView.postMessage("url:" + s);
              };
              window.copyToClipboard = function(s) {
                window.ReactNativeWebView.postMessage("copy:" + s);
              };
              window.downloadImages = function(s) {
                window.ReactNativeWebView.postMessage("images:" + s);
              };
              window.requestGameWebToken = function() {
                Promise.resolve().then(() => window.onGameWebTokenReceive?.call(null, "${webServiceToken.accessToken}"));
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
      </FullscreenModal>
    </Center>
  );
};

export { SplatNetViewRef };
export default forwardRef(SplatNetView);
