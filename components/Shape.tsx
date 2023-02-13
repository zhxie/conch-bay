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

export { Circle };
