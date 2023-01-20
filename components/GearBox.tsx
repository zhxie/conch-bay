import { StyleProp, View, ViewStyle, useColorScheme } from "react-native";
import Image, { SourceProps } from "./Image";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";

interface GearBoxProps {
  isFirst?: boolean;
  isLast?: boolean;
  image: SourceProps;
  brand: SourceProps;
  primaryGearPower: SourceProps;
  additionalGearPower: SourceProps[];
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
        props.isFirst && ViewStyles.rt,
        props.isLast && ViewStyles.rb,
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
          !props.isLast && {
            borderBottomWidth: 1,
            borderBottomColor: `${Color.MiddleTerritory}3f`,
          },
        ]}
      >
        <Image source={props.image} style={[ViewStyles.mr1, { width: 32, height: 32 }]} />
        <HStack center>
          <Center style={ViewStyles.mr1}>
            <Circle size={30} color={Color.DarkBackground} />
            <Image
              source={props.primaryGearPower}
              style={[
                ViewStyles.transparent,
                { width: 26, height: 26, position: "absolute", left: 2, top: 2 },
              ]}
            />
          </Center>
          {props.additionalGearPower.map((gearPower, i, gearPowers) => (
            <Center key={i} style={i === gearPowers.length - 1 ? undefined : ViewStyles.mr1}>
              <Circle size={20} color={Color.DarkBackground} />
              <Image
                source={gearPower}
                style={[
                  ViewStyles.transparent,
                  { width: 18, height: 18, position: "absolute", left: 1, top: 1 },
                ]}
              />
            </Center>
          ))}
          {new Array(props.paddingTo - props.additionalGearPower.length).fill(0).map((_, i) => (
            <View key={i} style={{ width: 24 }} />
          ))}
        </HStack>
      </HStack>
    </HStack>
  );
};

export default GearBox;
