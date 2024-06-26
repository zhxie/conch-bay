import { StyleProp, View, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface GearBoxProps {
  first?: boolean;
  last?: boolean;
  image: ImageSource;
  brandImage?: ImageSource;
  name: string;
  brand?: string;
  primaryAbility: ImageSource;
  additionalAbility: ImageSource[];
  paddingTo: number;
  style?: StyleProp<ViewStyle>;
}

const GearBox = (props: GearBoxProps) => {
  const theme = useTheme();

  return (
    <HStack
      style={[
        ViewStyles.px3,
        { height: 48 },
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        theme.territoryStyle,
        props.style,
      ]}
    >
      <HStack
        flex
        center
        justify
        style={[ViewStyles.py2, !props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
      >
        <HStack flex center style={ViewStyles.mr1}>
          {/* HACK: the right margin looks wider than the left one due to optical illusion. */}
          <Center style={ViewStyles.mr2}>
            <Image source={props.image} style={{ width: 32, height: 32 }} />
            <Image
              source={props.brandImage}
              style={[
                ViewStyles.transparent,
                { width: 12, height: 12, position: "absolute", left: 0, top: 0 },
              ]}
            />
          </Center>
          <HStack flex>
            <Marquee>
              <Text style={TextStyles.subtle}>{props.brand} </Text>
              {props.name}
            </Marquee>
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
