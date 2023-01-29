import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import Lucide from "./Lucide";
import Pressable from "./Pressable";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface ToolButtonProps {
  isDisabled?: boolean;
  isLoading: boolean;
  isLoadingText: string;
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
      style={[ViewStyles.p3, { height: 44, borderRadius: 22 }, props.style]}
      onPress={props.onPress}
    >
      <HStack flex center>
        {(() => {
          if (props.isLoading) {
            return <ActivityIndicator style={ViewStyles.mr1} />;
          } else {
            return (
              <Lucide
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
          {props.isLoading ? props.isLoadingText : props.title}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default ToolButton;
