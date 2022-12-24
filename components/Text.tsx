import { Text as RNText, TextProps as RNTextProps, useColorScheme } from "react-native";
import { TextStyles } from "./Styles";

interface TextProps extends RNTextProps {
  center?: boolean;
}

const Text = (props: TextProps) => {
  const { center, style, ...rest } = props;

  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return <RNText style={[TextStyles.p, textStyle, center && TextStyles.c, style]} {...rest} />;
};

export default Text;
