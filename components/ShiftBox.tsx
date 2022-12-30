import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";
import Image from "./Image";
import Text from "./Text";
import { HStack, VStack } from "./Stack";

interface StageProps {
  title: string;
  image: string;
  cacheKey: string;
}
interface WeaponProps {
  image: string;
  cacheKey: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stage: StageProps;
  weapons: WeaponProps[];
  style?: StyleProp<ViewStyle>;
}

const ShiftBox = (props: ScheduleBoxProps) => {
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
          <VStack flex center style={ViewStyles.mr2}>
            <Image
              uri={props.stage.image}
              cacheKey={props.stage.cacheKey}
              style={[ViewStyles.mb1, ViewStyles.r, styles.stage]}
            />
            <Text numberOfLines={1}>{props.stage.title}</Text>
          </VStack>
          <VStack flex center>
            <HStack center>
              {props.weapons.map((weapon, i, weapons) => (
                <Image
                  key={i}
                  uri={weapon.image}
                  cacheKey={weapon.cacheKey}
                  style={[
                    i !== weapons.length - 1 ? ViewStyles.mr1 : undefined,
                    ViewStyles.f,
                    styles.weapon,
                  ]}
                />
              ))}
            </HStack>
            <Text numberOfLines={1}> </Text>
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
