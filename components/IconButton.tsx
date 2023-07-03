import { StyleProp, ViewStyle } from "react-native";
import Icon from "./Icon";
import Pressable from "./Pressable";
import { Center } from "./Stack";
import { Color } from "./Styles";

interface IconButtonProps {
  isDisabled?: boolean;
  size: number;
  color?: string;
  icon: string;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
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
        <Icon
          name={props.icon as any}
          size={props.size * 0.5}
          color={props.color ? "white" : Color.MiddleTerritory}
        />
      </Center>
    </Pressable>
  );
};

const PureIconButton = (props: IconButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
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
          name={props.icon as any}
          size={props.size}
          color={props.color ? "white" : Color.MiddleTerritory}
        />
      </Center>
    </Pressable>
  );
};

export { IconButton, PureIconButton };
