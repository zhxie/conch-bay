import { ColorValue, StyleProp, View, ViewStyle } from "react-native";

interface ShapeProps {
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}

interface CircleProps extends ShapeProps {
  size: number;
  outline?: ColorValue;
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

interface RectangleProps extends ShapeProps {
  width: number;
  height: number;
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
