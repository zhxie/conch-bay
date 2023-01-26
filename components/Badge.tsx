import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Center } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

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
    <Center
      style={[
        ViewStyles.px2,
        ViewStyles.py1,
        ViewStyles.r0_5,
        { backgroundColor: `${props.color}${opacity}` },
        props.style,
      ]}
    >
      <Text style={[TextStyles.h5, { color: fontColor }]}>{props.title}</Text>
    </Center>
  );
};

export default Badge;
