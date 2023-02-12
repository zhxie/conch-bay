import { StyleProp, TextStyle, useColorScheme } from "react-native";
import TextTicker from "react-native-text-ticker";
import { TextStyles } from "./Styles";

interface MarqueeProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const Marquee = (props: MarqueeProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return (
    <TextTicker
      animationType="scroll"
      repeatSpacer={20}
      easing={(value) => value}
      marqueeDelay={500}
      style={[TextStyles.p, textStyle, props.style]}
    >
      {props.children}
    </TextTicker>
  );
};

export default Marquee;
