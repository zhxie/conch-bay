import { StyleProp, View, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface GearBoxProps {
  isFirst?: boolean;
  isLast?: boolean;
  image: ImageSource;
  brandImage?: ImageSource;
  name: string;
  brand?: string;
  primaryAbility: ImageSource;
  additionalAbility: ImageSource[];
  recyclingKey?: string;
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
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        theme.territoryStyle,
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
          {/* HACK: the right margin looks wider than the left one due to optical illusion. */}
          <Center style={ViewStyles.mr2}>
            <Image
              source={props.image}
              recyclingKey={props.recyclingKey}
              style={{ width: 32, height: 32 }}
            />
            <Image
              source={props.brandImage}
              recyclingKey={props.recyclingKey}
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
              recyclingKey={props.recyclingKey}
              style={[ViewStyles.transparent, { width: 26, height: 26, position: "absolute" }]}
            />
          </Center>
          {props.additionalAbility.map((gearPower, i, gearPowers) => (
            <Center key={i} style={i === gearPowers.length - 1 ? undefined : ViewStyles.mr1}>
              <Circle size={20} color={Color.DarkBackground} />
              <Image
                source={gearPower}
                recyclingKey={props.recyclingKey}
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
