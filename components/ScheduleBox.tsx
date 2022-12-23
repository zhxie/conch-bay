import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";
import Image from "./Image";
import Text from "./Text";
import { HStack, VStack } from "./Stack";

interface StageProps {
  title: string;
  image: string;
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
        <HStack flex center style={ViewStyles.mb1}>
          <Text numberOfLines={1} style={TextStyles.b}>
            {props.rule}
          </Text>
          <HStack flex reverse>
            <Text numberOfLines={1} style={TextStyles.subtle}>
              {props.time}
            </Text>
          </HStack>
        </HStack>
        <HStack flex center>
          {props.stages.map((stage, i, stages) => (
            <VStack
              flex
              center
              key={i}
              style={i !== stages.length - 1 ? ViewStyles.mr2 : undefined}
            >
              <Image uri={stage.image} style={[ViewStyles.mb1, ViewStyles.r, styles.image]} />
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
