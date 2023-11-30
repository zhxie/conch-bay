import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface Stage {
  title: string;
  image: ImageSource;
}
interface WeaponProps {
  image: ImageSource;
  tintColor?: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stage: Stage;
  boss: string;
  weapons: WeaponProps[];
  style?: StyleProp<ViewStyle>;
}

const ShiftBox = (props: ScheduleBoxProps) => {
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
          <VStack flex center style={ViewStyles.mr2}>
            <Image
              source={props.stage.image}
              style={[ViewStyles.mb1, ViewStyles.r2, styles.stage]}
            />
            <Marquee>{props.stage.title}</Marquee>
          </VStack>
          <VStack flex center>
            <HStack center>
              {props.weapons.map((weapon, i, weapons) => (
                <Image
                  key={i}
                  source={weapon.image}
                  style={[
                    i !== weapons.length - 1 ? ViewStyles.mr1 : undefined,
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
      </VStack>
    </HStack>
  );
};

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  weapon: {
    width: "100%",
    aspectRatio: 1 / 1,
    backgroundColor: "transparent",
  },
});

export default ShiftBox;
