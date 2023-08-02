import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { ViewStyles, useTheme } from "./Styles";

interface PressableProps {
  disabled?: boolean;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
}

const Pressable = (props: PressableProps) => {
  const theme = useTheme();

  const disabledStyle = props.disabled ? ViewStyles.disabled : undefined;

  return (
    <TouchableOpacity
      disabled={props.disabled}
      hitSlop={props.hitSlop}
      style={[theme.territoryStyle, disabledStyle, props.style]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      {props.children}
    </TouchableOpacity>
  );
};

export default Pressable;
