import Pressable from "./Pressable";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { TextStyles, ViewStyles } from "./Styles";

interface ButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  isLoadingText?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
}

const Button = (props: ButtonProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return (
    <Pressable
      isDisabled={props.isDisabled || props.isLoading}
      style={[ViewStyles.c, ViewStyles.px3, { borderRadius: 4 }, props.style]}
      onPress={props.onPress}
    >
      {props.isLoading && (
        <View style={[ViewStyles.f, ViewStyles.hc, ViewStyles.c]}>
          <ActivityIndicator style={ViewStyles.mr1} />
          <Text
            numberOfLines={1}
            style={[ViewStyles.py3, TextStyles.p, textStyle, props.textStyle]}
          >
            {props.isLoadingText}
          </Text>
        </View>
      )}
      {!props.isLoading && (
        <View style={[ViewStyles.hc, ViewStyles.c, ViewStyles.py3]}>{props.children}</View>
      )}
    </Pressable>
  );
};

export default Button;
