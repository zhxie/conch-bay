import { StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";

interface BadgeProps {
  color: string;
  title: string;
  style?: StyleProp<ViewStyle>;
}

const Badge = (props: BadgeProps) => {
  const colorScheme = useColorScheme();
  const opacity = colorScheme === "light" ? "1f" : "af";
  const fontColor = colorScheme === "light" ? props.color : "#ffffffaf";

  return (
    <View
      style={[
        ViewStyles.c,
        ViewStyles.px2,
        ViewStyles.py1,
        { backgroundColor: `${props.color}${opacity}`, borderRadius: 2 },
        props.style,
      ]}
    >
      <Text style={[TextStyles.h5, { color: fontColor }]}>{props.title}</Text>
    </View>
  );
};

export default Badge;
