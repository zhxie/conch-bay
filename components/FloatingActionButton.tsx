import { IconButton } from "./IconButton";
import { ViewStyles } from "./Styles";

interface FloatingActionButtonProps {
  isDisabled?: boolean;
  size: number;
  color?: string;
  icon: string;
  onPress?: () => void;
}

const FloatingActionButton = (props: FloatingActionButtonProps) => {
  return (
    <IconButton
      isDisabled={props.isDisabled}
      size={props.size}
      color={props.color}
      icon={props.icon}
      style={[ViewStyles.s2, { position: "absolute", right: 20, bottom: 20 }]}
      onPress={props.onPress}
    />
  );
};

export default FloatingActionButton;
