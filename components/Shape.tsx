import { Animated, DimensionValue, StyleProp, ViewStyle } from "react-native";

interface CircleProps {
  size: number;
  color?: string | Animated.AnimatedInterpolation<string | number>;
  outline?: string | Animated.AnimatedInterpolation<string | number>;
  style?: StyleProp<ViewStyle>;
}

const Circle = (props: CircleProps) => {
  return (
    <Animated.View
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
  width: DimensionValue;
  height: DimensionValue;
  color?: string | Animated.AnimatedInterpolation<string | number>;
  style?: StyleProp<ViewStyle>;
}

const Rectangle = (props: RectangleProps) => {
  return (
    <Animated.View
      style={[
        { width: props.width, height: props.height, backgroundColor: props.color },
        props.style,
      ]}
    />
  );
};

export { Circle, Rectangle };
