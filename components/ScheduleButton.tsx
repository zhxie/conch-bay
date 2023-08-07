import { ColorValue, StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

interface ScheduleButtonProps {
  rule: string;
  stages: string[];
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ScheduleButton = (props: ScheduleButtonProps) => {
  return (
    <Pressable
      disabled={props.rule.length === 0}
      style={[ViewStyles.r2, ViewStyles.p2, { width: 160, height: 80 }, props.style]}
      onPress={props.onPress}
    >
      <VStack flex justify>
        <HStack center style={ViewStyles.mb1}>
          {props.rule.length > 0 && (
            // HACK: the right margin looks wider than the left one due to optical illusion.
            <Circle
              size={12}
              color={props.color ?? Color.MiddleTerritory}
              style={ViewStyles.mr1_5}
            />
          )}
          <HStack flex>
            <Marquee
              style={[TextStyles.h2, TextStyles.subtle, !!props.color && { color: props.color }]}
            >
              {props.rule}
            </Marquee>
          </HStack>
        </HStack>
        <VStack>
          {props.stages.map((stage, i) => (
            <Marquee key={i}>{stage}</Marquee>
          ))}
        </VStack>
      </VStack>
    </Pressable>
  );
};

export default ScheduleButton;
