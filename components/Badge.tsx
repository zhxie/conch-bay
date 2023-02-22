import { StyleProp, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import { Center } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface BadgeProps {
  color: string;
  title: string;
  size?: "large" | "small";
  style?: StyleProp<ViewStyle>;
}

const Badge = (props: BadgeProps) => {
  const colorScheme = useColorScheme();
  const opacity = colorScheme === "light" ? "1f" : "af";
  const fontColor = colorScheme === "light" ? props.color : "#ffffffaf";

  return (
    <Center
      style={[
        viewStyles[props.size ?? "large"],
        ViewStyles.r0_5,
        { backgroundColor: `${props.color}${opacity}` },
        props.style,
      ]}
    >
      <Text style={[textStyles[props.size ?? "large"], { color: fontColor }]}>{props.title}</Text>
    </Center>
  );
};

const viewStyles = StyleSheet.create({
  small: {
    ...ViewStyles.px1,
    ...ViewStyles.py0_5,
  },
  large: {
    ...ViewStyles.px2,
    ...ViewStyles.py1,
  },
});

const textStyles = StyleSheet.create({
  small: {
    ...TextStyles.h7,
  },
  large: {
    ...TextStyles.h5,
  },
});

export default Badge;
