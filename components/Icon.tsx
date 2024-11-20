import createIconSet from "@expo/vector-icons/createIconSet";
import { StyleProp, TextStyle } from "react-native";
import { Lucide } from "../assets/fonts/Lucide";
import glyphMap from "../assets/fonts/Lucide.json";

// HACK: the 3rd argument expoAssetId actually is not used.
const LucideIcon = createIconSet(glyphMap, "Lucide", "Lucide");

interface IconProps {
  name: Lucide;
  size: number;
  color?: string;
  style?: StyleProp<TextStyle>;
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
