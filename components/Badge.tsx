import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { Center } from "./Stack";
import { TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface BadgeProps {
  color: string;
  title: string;
  size?: "large" | "small";
  style?: StyleProp<ViewStyle>;
}

const Badge = (props: BadgeProps) => {
  const theme = useTheme();
  const opacity = theme.colorScheme === "light" ? "1f" : "af";
  const fontColor = theme.colorScheme === "light" ? props.color : "#ffffffaf";

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

interface BadgeButtonProps extends BadgeProps {
  disable?: boolean;
  onPress: () => void;
}

const BadgeButton = (props: BadgeButtonProps) => {
  const { onPress, style, ...rest } = props;

  if (props.disable) {
    return <Badge {...rest} />;
  }

  return (
    <Pressable onPress={onPress} style={[ViewStyles.transparent, style]}>
      <Badge {...rest} />
    </Pressable>
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

export { Badge, BadgeButton };
