import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import Icon, { IconName } from "./Icon";
import Pressable from "./Pressable";
import { Center, HStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface ToolButtonProps {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  color?: string;
  icon: IconName;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ToolButton = (props: ToolButtonProps) => {
  return (
    <Pressable
      disabled={props.disabled || props.loading}
      // HACK: make rounded corner at best effort.
      style={[ViewStyles.p3, { borderRadius: 44 }, props.style]}
      onPress={props.onPress}
    >
      <HStack center>
        {(() => {
          if (props.loading) {
            return (
              <Center style={{ height: 16 }}>
                <ActivityIndicator style={ViewStyles.mr1} />
              </Center>
            );
          } else {
            return (
              <Icon
                name={props.icon}
                size={16}
                color={props.color ?? Color.MiddleTerritory}
                style={ViewStyles.mr1}
              />
            );
          }
        })()}
        <Text numberOfLines={1} style={TextStyles.h3}>
          {props.loading ? (props.loadingText ?? props.title) : props.title}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default ToolButton;
