import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import ScheduleListBox from "./ScheduleListBox";
import { HStack, VStack } from "./Stack";
import { ViewStyles } from "./Styles";

interface Stage {
  title: string;
  image: ImageSource;
}
interface ScheduleBoxProps {
  first?: boolean;
  last?: boolean;
  rule: string;
  time: string;
  stages: Stage[];
  style?: StyleProp<ViewStyle>;
}

const ScheduleBox = (props: ScheduleBoxProps) => {
  return (
    <ScheduleListBox
      first={props.first}
      last={props.last}
      title={props.rule}
      time={props.time}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack flex center>
        {props.stages.map((stage, i, stages) => (
          <VStack flex center key={i} style={i !== stages.length - 1 ? ViewStyles.mr2 : undefined}>
            <Image source={stage.image} style={[ViewStyles.mb1, ViewStyles.r2, styles.stage]} />
            <Marquee>{stage.title}</Marquee>
          </VStack>
        ))}
      </HStack>
    </ScheduleListBox>
  );
};

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});

export default ScheduleBox;
