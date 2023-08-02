import { StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { HStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface GroupButtonProps<T> {
  group?: T;
  first?: boolean;
  last?: boolean;
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
  onPress?: (group: T) => void;
}

const GroupButton = <T,>(props: GroupButtonProps<T>) => {
  const onPress = () => {
    if (props.group && props.onPress) {
      props.onPress(props.group);
    }
  };

  return (
    <Pressable
      style={[
        ViewStyles.px3,
        { height: 32 },
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        props.style,
      ]}
      onPress={onPress}
    >
      <HStack
        flex
        center
        justify
        style={[ViewStyles.py1, !props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
      >
        <HStack style={ViewStyles.i}>
          <Marquee style={[TextStyles.b, TextStyles.subtle]}>{props.title}</Marquee>
        </HStack>
        <HStack center>
          <Text style={TextStyles.subtle}>{props.subtitle}</Text>
        </HStack>
      </HStack>
    </Pressable>
  );
};

export default GroupButton;
