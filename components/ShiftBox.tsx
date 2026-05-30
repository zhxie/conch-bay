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
interface WeaponProps {
  image: ImageSource;
  tintColor?: string;
}
interface ScheduleBoxProps {
  first?: boolean;
  last?: boolean;
  rule: string;
  time: string;
  stage: Stage;
  boss: string;
  weapons: WeaponProps[];
  style?: StyleProp<ViewStyle>;
}

const ShiftBox = (props: ScheduleBoxProps) => {
  return (
    <ScheduleListBox
      first={props.first}
      last={props.last}
      title={props.rule}
      time={props.time}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack flex center>
        <VStack flex center style={ViewStyles.mr2}>
          <Image source={props.stage.image} style={[ViewStyles.mb1, ViewStyles.r2, styles.stage]} />
          <Marquee>{props.stage.title}</Marquee>
        </VStack>
        <VStack flex center>
          <HStack center style={ViewStyles.mb1}>
            {props.weapons.map((weapon, i, weapons) => (
              <Image
                key={i}
                source={weapon.image}
                style={[
                  i !== weapons.length - 1 && ViewStyles.mr1,
                  ViewStyles.f,
                  styles.weapon,
                  { tintColor: weapon.tintColor },
                ]}
              />
            ))}
          </HStack>
          <Marquee>{props.boss}</Marquee>
        </VStack>
      </HStack>
    </ScheduleListBox>
  );
};

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  weapon: {
    aspectRatio: 1 / 1,
  },
});

export default ShiftBox;
