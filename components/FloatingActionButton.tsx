import { ColorValue } from "react-native";
import { IconName } from "./Icon";
import { IconButton } from "./IconButton";
import { ViewStyles } from "./Styles";

interface FloatingActionButtonProps {
  disabled?: boolean;
  size: number;
  color?: ColorValue;
  icon: IconName;
  spin?: boolean;
  onPress?: () => void;
}

const FloatingActionButton = (props: FloatingActionButtonProps) => {
  return (
    <IconButton
      disabled={props.disabled}
      size={props.size}
      color={props.color}
      icon={props.icon}
      spin={props.spin}
      style={[ViewStyles.s2, { position: "absolute", right: 20, bottom: 20 }]}
      onPress={props.onPress}
    />
  );
};

export default FloatingActionButton;
