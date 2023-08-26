import { Transition, useToastBannerToggler } from "react-native-toast-banner";
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
    showBannerInner({
      contentView: (
        <Text
          style={[ViewStyles.px4, ViewStyles.py2, TextStyles.h2, TextStyles.c, TextStyles.dark]}
        >
          {content}
        </Text>
      ),
      backgroundColor,
      transitions: [Transition.MoveLinear],
    });
  };

  return showBanner;
};

export { BannerLevel };
export default useBanner;
