import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface StageProps {
  title: string;
  image: ImageSource;
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
          <HStack flex style={ViewStyles.mr1}>
            <Marquee style={TextStyles.b}>{props.rule}</Marquee>
          </HStack>
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
              <Image source={stage.image} style={[ViewStyles.mb1, ViewStyles.r2, styles.image]} />
              <Marquee>{stage.title}</Marquee>
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
