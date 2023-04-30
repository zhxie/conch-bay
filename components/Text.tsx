import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { TextStyles, useTheme } from "./Styles";

interface TextProps extends RNTextProps {
  center?: boolean;
}

const Text = (props: TextProps) => {
  const { center, style, ...rest } = props;

  const theme = useTheme();

  return (
    <RNText style={[TextStyles.p, theme.textStyle, center && TextStyles.c, style]} {...rest} />
  );
};

export default Text;
