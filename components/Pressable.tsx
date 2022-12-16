import { StyleProp, TouchableOpacity, useColorScheme, ViewStyle } from "react-native";
import { ViewStyles } from "./Styles";

interface PressableProps {
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
}

const Pressable = (props: PressableProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;
  const disabledStyle = props.isDisabled ? ViewStyles.disabled : undefined;

  return (
    <TouchableOpacity
      disabled={props.isDisabled}
      style={[style, props.style, disabledStyle]}
      onPress={props.onPress}
    >
      {props.children}
    </TouchableOpacity>
  );
};

export default Pressable;
