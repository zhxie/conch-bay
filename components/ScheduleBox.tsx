import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image from "./Image";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface StageProps {
  title: string;
  image: string;
  cacheKey: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stages: StageProps[];
  style?: StyleProp<ViewStyle>;
}

const ScheduleBox = (props: ScheduleBoxProps) => {
  return (
    <HStack flex style={props.style}>
      <VStack flex>
        <HStack flex center justify style={ViewStyles.mb1}>
          <Text numberOfLines={1} style={[ViewStyles.f, ViewStyles.mr1, TextStyles.b]}>
            {props.rule}
          </Text>
          <Text numberOfLines={1} style={TextStyles.subtle}>
            {props.time}
          </Text>
        </HStack>
        <HStack flex center>
          {props.stages.map((stage, i, stages) => (
            <VStack
              flex
              center
              key={i}
              style={i !== stages.length - 1 ? ViewStyles.mr2 : undefined}
            >
              <Image
                uri={stage.image}
                cacheKey={stage.cacheKey}
                style={[ViewStyles.mb1, ViewStyles.r, styles.image]}
              />
              <Text numberOfLines={1}>{stage.title}</Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </HStack>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});

export default ScheduleBox;
