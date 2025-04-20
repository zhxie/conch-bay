import { Transition, useToastBannerToggler } from "react-native-toast-banner";
import { VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

enum BannerLevel {
  Success,
  Info,
  Warn,
  Error,
}
const useBanner = () => {
  const { showBanner: showBannerInner } = useToastBannerToggler();

  const showBanner = (level: BannerLevel, content: any) => {
    let backgroundColor: string;
    switch (level) {
      case BannerLevel.Success:
        backgroundColor = Color.KillAndRescue;
        break;
      case BannerLevel.Info:
        backgroundColor = Color.UltraSignal;
        break;
      case BannerLevel.Warn:
        backgroundColor = Color.Special;
        break;
      case BannerLevel.Error:
        backgroundColor = Color.Death;
        break;
    }
    if (content instanceof Error) {
      content = content.message;
    }
    let subContent: string | undefined = undefined;
    if (typeof content === "string" && content.endsWith(")")) {
      const contents = content.split("(", 2);
      content = contents[0];
      if (contents.length > 1) {
        subContent = contents[1].slice(0, -1);
      }
    }
    showBannerInner({
      contentView: (
        <VStack style={[ViewStyles.px4, ViewStyles.py2]}>
          <Text
            style={[
              subContent !== undefined && ViewStyles.mb1,
              TextStyles.h2,
              TextStyles.c,
              TextStyles.dark,
            ]}
          >
            {content}
          </Text>
          {subContent !== undefined && (
            <Text style={[TextStyles.h5, TextStyles.c, TextStyles.dark]}>{subContent}</Text>
          )}
        </VStack>
      ),
      backgroundColor,
      transitions: [Transition.MoveLinear],
    });
  };

  return showBanner;
};

export { BannerLevel };
export default useBanner;
