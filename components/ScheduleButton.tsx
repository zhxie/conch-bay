import { StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface ScheduleButtonProps {
  rule: string;
  stages: string[];
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ScheduleButton = (props: ScheduleButtonProps) => {
  return (
    <Pressable
      isDisabled={props.rule.length === 0}
      style={[ViewStyles.r2, ViewStyles.p2, { width: 160, height: 80 }, props.style]}
      onPress={props.onPress}
    >
      <VStack flex justify>
        <HStack center style={ViewStyles.mb2}>
          {props.rule.length > 0 && (
            <Circle
              size={12}
              color="#a1a1aa"
              style={[ViewStyles.mr2, !!props.color && { backgroundColor: props.color }]}
            />
          )}
          <Text
            numberOfLines={1}
            style={[
              ViewStyles.f,
              TextStyles.h2,
              TextStyles.subtle,
              !!props.color && { color: props.color },
            ]}
          >
            {props.rule}
          </Text>
        </HStack>
        <VStack>
          {props.stages.map((stage, i) => (
            <Text key={i} numberOfLines={1}>
              {stage}
            </Text>
          ))}
        </VStack>
      </VStack>
    </Pressable>
  );
};

export default ScheduleButton;
