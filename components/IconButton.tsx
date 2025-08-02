import { StyleProp, ViewStyle } from "react-native";
import Icon, { AnimatedIcon, IconName } from "./Icon";
import Pressable from "./Pressable";
import { Center } from "./Stack";
import { Color } from "./Styles";

interface IconButtonProps {
  disabled?: boolean;
  size: number;
  color?: string;
  icon: IconName;
  spin?: boolean;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <Pressable
      disabled={props.disabled}
      hitSlop={props.hitSlop}
      style={[
        {
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
        },
        !!props.color && { backgroundColor: props.color },
        props.style,
      ]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      <Center flex>
        <AnimatedIcon
          name={props.icon}
          size={props.size * 0.5}
          color={props.color ? "white" : Color.MiddleTerritory}
          spin={props.spin}
        />
      </Center>
    </Pressable>
  );
};

const PureIconButton = (props: IconButtonProps) => {
  return (
    <Pressable
      disabled={props.disabled}
      hitSlop={props.hitSlop}
      style={[
        {
          width: props.size,
          height: props.size,
          backgroundColor: "transparent",
        },
        props.style,
      ]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      <Center flex>
        <Icon
          name={props.icon}
          size={props.size}
          color={props.color ? "white" : Color.MiddleTerritory}
        />
      </Center>
    </Pressable>
  );
};

export { IconButton, PureIconButton };
