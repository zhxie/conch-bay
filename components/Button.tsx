import { ActivityIndicator, StyleProp, TextStyle, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { Center, HStack } from "./Stack";
import { ViewStyles } from "./Styles";
import Text from "./Text";

interface ButtonProps {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
}

const Button = (props: ButtonProps) => {
  return (
    <Pressable
      disabled={props.disabled || props.loading}
      style={[ViewStyles.c, ViewStyles.px3, ViewStyles.r1, props.style]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      {props.loading && (
        <Center flex>
          <HStack flex center>
            <ActivityIndicator style={ViewStyles.mr1} />
            <Text numberOfLines={1} style={[ViewStyles.py3, props.textStyle]}>
              {props.loadingText}
            </Text>
          </HStack>
        </Center>
      )}
      {!props.loading && (
        <Center>
          <HStack center style={ViewStyles.py3}>
            {props.children}
          </HStack>
        </Center>
      )}
    </Pressable>
  );
};

export default Button;
