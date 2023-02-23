import { StyleProp, View, ViewStyle, useColorScheme } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";

interface GearBoxProps {
  isFirst?: boolean;
  isLast?: boolean;
  image: ImageSource;
  brand: ImageSource;
  name: string;
  primaryAbility: ImageSource;
  additionalAbility: ImageSource[];
  paddingTo: number;
  style?: StyleProp<ViewStyle>;
}

const GearBox = (props: GearBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <HStack
      style={[
        ViewStyles.px3,
        { height: 48 },
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        style,
        props.style,
      ]}
    >
      <HStack
        flex
        center
        justify
        style={[
          ViewStyles.py2,
          !props.isFirst && ViewStyles.sept,
          !props.isLast && ViewStyles.sepb,
        ]}
      >
        <HStack flex center style={ViewStyles.mr1}>
          <Center style={ViewStyles.mr3}>
            <Image source={props.image} style={{ width: 32, height: 32 }} />
            <Image
              source={props.brand}
              style={[
                ViewStyles.transparent,
                { width: 12, height: 12, position: "absolute", left: 0, top: 0 },
              ]}
            />
          </Center>
          <HStack flex>
            <Marquee>{props.name}</Marquee>
          </HStack>
        </HStack>
        <HStack center>
          <Center style={ViewStyles.mr1}>
            <Circle size={30} color={Color.DarkBackground} />
            <Image
              source={props.primaryAbility}
              style={[ViewStyles.transparent, { width: 26, height: 26, position: "absolute" }]}
            />
          </Center>
          {props.additionalAbility.map((gearPower, i, gearPowers) => (
            <Center key={i} style={i === gearPowers.length - 1 ? undefined : ViewStyles.mr1}>
              <Circle size={20} color={Color.DarkBackground} />
              <Image
                source={gearPower}
                style={[ViewStyles.transparent, { width: 18, height: 18, position: "absolute" }]}
              />
            </Center>
          ))}
          {new Array(props.paddingTo - props.additionalAbility.length).fill(0).map((_, i) => (
            <View key={i} style={{ width: 24 }} />
          ))}
        </HStack>
      </HStack>
    </HStack>
  );
};

export default GearBox;
