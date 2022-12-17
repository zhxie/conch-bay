import { StyleProp, View, ViewStyle } from "react-native";

interface CircleProps {
  size: number;
  color?: string;
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
          backgroundColor: props.color,
        },
        props.style,
      ]}
    />
  );
};

export { Circle };
