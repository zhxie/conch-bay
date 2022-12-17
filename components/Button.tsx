import Pressable from "./Pressable";
import { ActivityIndicator, StyleProp, TextStyle, ViewStyle } from "react-native";
import { ViewStyles } from "./Styles";
import Text from "./Text";
import { Center, HStack } from "./Stack";

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
  return (
    <Pressable
      isDisabled={props.isDisabled || props.isLoading}
      style={[ViewStyles.c, ViewStyles.px3, { borderRadius: 4 }, props.style]}
      onPress={props.onPress}
    >
      {props.isLoading && (
        <Center flex>
          <HStack flex center>
            <ActivityIndicator style={ViewStyles.mr1} />
            <Text numberOfLines={1} style={[ViewStyles.py3, props.textStyle]}>
              {props.isLoadingText}
            </Text>
          </HStack>
        </Center>
      )}
      {!props.isLoading && (
        <Center flex>
          <HStack flex center style={ViewStyles.py3}>
            {props.children}
          </HStack>
        </Center>
      )}
    </Pressable>
  );
};

export default Button;
