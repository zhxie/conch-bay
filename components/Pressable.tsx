import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { ViewStyles, useTheme } from "./Styles";

interface PressableProps {
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
}

const Pressable = (props: PressableProps) => {
  const theme = useTheme();

  const disabledStyle = props.isDisabled ? ViewStyles.disabled : undefined;

  return (
    <TouchableOpacity
      disabled={props.isDisabled}
      style={[theme.territoryStyle, disabledStyle, props.style]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      {props.children}
    </TouchableOpacity>
  );
};

export default Pressable;
