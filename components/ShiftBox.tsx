import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image, { SourceProps } from "./Image";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface StageProps {
  title: string;
  image: SourceProps;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stage: StageProps;
  weapons: SourceProps[];
  style?: StyleProp<ViewStyle>;
}

const ShiftBox = (props: ScheduleBoxProps) => {
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
          <VStack flex center style={ViewStyles.mr2}>
            <Image
              source={props.stage.image}
              style={[ViewStyles.mb1, ViewStyles.r, styles.stage]}
            />
            <Text numberOfLines={1}>{props.stage.title}</Text>
          </VStack>
          <VStack flex center>
            <HStack center>
              {props.weapons.map((weapon, i, weapons) => (
                <Image
                  key={i}
                  source={weapon}
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
