import { Text as RNText, TextProps, useColorScheme } from "react-native";
import { TextStyles } from "./Styles";

const Text = (props: TextProps) => {
  const { style, ...rest } = props;

  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return <RNText style={[TextStyles.p, textStyle, style]} {...rest} />;
};

export default Text;
