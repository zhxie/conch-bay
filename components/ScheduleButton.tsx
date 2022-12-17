import { StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack, VStack } from "./Stack";
import { Circle } from "./Shape";

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
      style={[ViewStyles.r, ViewStyles.p2, { width: 160, height: 80 }, props.style]}
      onPress={props.onPress}
    >
      <VStack flex>
        <HStack center style={ViewStyles.mb2}>
          {props.rule.length > 0 && (
            <Circle
              size={12}
              color="#a1a1aa"
              style={[
                ViewStyles.mr2,
                props.color !== undefined && { backgroundColor: props.color },
              ]}
            />
          )}
          <Text
            numberOfLines={1}
            style={[
              TextStyles.h2,
              TextStyles.subtle,
              props.color !== undefined && { color: props.color },
            ]}
          >
            {props.rule}
          </Text>
        </HStack>
        <VStack flex reverse>
          {props.stages
            .slice()
            .reverse()
            .map((stage, i) => (
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
