import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import Icon from "./Icon";
import Pressable from "./Pressable";
import { Center, HStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface ToolButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  isLoadingText?: string;
  color?: string;
  icon: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ToolButton = (props: ToolButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled || props.isLoading}
      // HACK: make rounded corner at best effort.
      style={[ViewStyles.p3, { borderRadius: 44 }, props.style]}
      onPress={props.onPress}
    >
      <HStack center>
        {(() => {
          if (props.isLoading) {
            return (
              <Center style={{ height: 16 }}>
                <ActivityIndicator style={ViewStyles.mr1} />
              </Center>
            );
          } else {
            return (
              <Icon
                // HACK: forcly cast.
                name={props.icon as any}
                size={16}
                color={props.color ?? Color.MiddleTerritory}
                style={ViewStyles.mr1}
              />
            );
          }
        })()}
        <Text numberOfLines={1} style={TextStyles.h3}>
          {props.isLoading ? props.isLoadingText ?? props.title : props.title}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default ToolButton;
