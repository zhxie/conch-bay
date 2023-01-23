import { StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { HStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface DisplayProps {
  isFirst?: boolean;
  isLast?: boolean;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
}

const Display = (props: DisplayProps) => {
  return (
    <Pressable
      style={[
        ViewStyles.px3,
        { height: 32 },
        props.isFirst && ViewStyles.rt,
        props.isLast && ViewStyles.rb,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <HStack
        flex
        center
        justify
        style={[!props.isFirst && ViewStyles.sept, !props.isLast && ViewStyles.sepb]}
      >
        <HStack flex center style={ViewStyles.mr1}>
          <Text numberOfLines={1} style={TextStyles.b}>
            {props.title}
          </Text>
        </HStack>
        <HStack center>{props.children}</HStack>
      </HStack>
    </Pressable>
  );
};

export default Display;
