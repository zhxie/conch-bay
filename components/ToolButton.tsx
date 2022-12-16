import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";
import { Color } from "../models";
import Pressable from "./Pressable";
import { TextStyles, ViewStyles } from "./Styles";

interface ToolButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
  isLoadingText: string;
  icon: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ToolButton = (props: ToolButtonProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return (
    <Pressable
      isDisabled={props.isDisabled || props.isLoading}
      style={[ViewStyles.p3, { height: 44, borderRadius: 22 }, props.style]}
      onPress={props.onPress}
    >
      <View style={[ViewStyles.hc]}>
        {(() => {
          if (props.isLoading) {
            return <ActivityIndicator style={ViewStyles.mr1} />;
          } else {
            return (
              <Feather
                name={props.icon as any}
                size={16}
                color={Color.MiddleTerritory}
                style={ViewStyles.mr1}
              />
            );
          }
        })()}
        <Text numberOfLines={1} style={[TextStyles.h3, textStyle]}>
          {props.isLoading ? props.isLoadingText : props.title}
        </Text>
      </View>
    </Pressable>
  );
};

export default ToolButton;
