import { StyleProp, View, ViewStyle } from "react-native";

interface CircleProps {
  size: number;
  color?: string;
  outline?: string;
  style?: StyleProp<ViewStyle>;
}

const Circle = (props: CircleProps) => {
  return (
    <View
      style={[
        {
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
          borderWidth: props.outline ? 2 : 0,
          backgroundColor: props.color,
          borderColor: props.outline,
        },
        props.style,
      ]}
    />
  );
};

interface RectangleProps {
  width: number;
  height: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const Rectangle = (props: RectangleProps) => {
  return (
    <View
      style={[
        { width: props.width, height: props.height, backgroundColor: props.color },
        props.style,
      ]}
    />
  );
};

export { Circle, Rectangle };
