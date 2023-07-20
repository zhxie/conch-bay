import { useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { Center, FullscreenModal, ToolButton } from "../components";
import t from "../i18n";

interface SplatNetViewViewProps {
  path?: string;
  webServiceToken: string;
  lang: string;
  style?: StyleProp<ViewStyle>;
}

const SplatNetView = (props: SplatNetViewViewProps) => {
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
                uri: `https://api.lp1.av5ja.srv.nintendo.net${props.path ?? "/"}?lang=${
                  props.lang
                }`,
                headers: {
                  Cookie: `_gtoken=${props.webServiceToken}`,
                  "X-Web-View-Ver": "4.0.0-d5178440",
                },
              }}
              onMessage={(event) => {
                if (event.nativeEvent.data === "close") {
                  setNet(false);
                }
              }}
              injectedJavaScript={`
                document.cookie = "_gtoken=${props.webServiceToken}";
                window.closeWebView = function() {
                  window.ReactNativeWebView.postMessage("close")
                };
                true;
              `}
              style={{ backgroundColor: "#292e35" }}
              startInLoadingState
              renderLoading={() => (
                <Center style={[{ width: "100%", height: "100%", backgroundColor: "#292e35" }]}>
                  <ActivityIndicator />
                </Center>
              )}
            />
          )}
        </SafeAreaView>
      </FullscreenModal>
    </Center>
  );
};

export default SplatNetView;
