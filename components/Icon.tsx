import createIconSet from "@expo/vector-icons/createIconSet";
import { StyleProp, ViewStyle } from "react-native";
import { Lucide } from "../assets/fonts/Lucide";
import glyphMap from "../assets/fonts/Lucide.json";

const LucideIcon = createIconSet(glyphMap, "Lucide", "../assets/fonts/Lucide.ttf");

interface IconProps {
  name: Lucide;
  size: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const Icon = (props: IconProps) => {
  return (
    <LucideIcon
      name={props.name}
      size={props.size}
      color={props.color}
      style={[{ lineHeight: props.size }, props.style]}
    />
  );
};

export { Lucide as IconName };
export default Icon;
