import { StyleProp, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import Image, { SourceProps } from "./Image";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface BattleWeaponBoxProps {
  image: SourceProps;
  name: string;
  subWeapon: SourceProps;
  specialWeapon: SourceProps;
  style?: StyleProp<ViewStyle>;
}

const BattleWeaponBox = (props: BattleWeaponBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <HStack
      style={[ViewStyles.px3, ViewStyles.py2, { height: 64 }, ViewStyles.r, style, props.style]}
    >
      <HStack flex center justify>
        <HStack flex center style={ViewStyles.mr1}>
          <Image source={props.image} style={[ViewStyles.mr3, { width: 48, height: 48 }]} />
          <HStack flex>
            <Text numberOfLines={1}>{props.name}</Text>
          </HStack>
        </HStack>
        <HStack center>
          <Center style={ViewStyles.mr1}>
            <Circle size={30} color={Color.DarkBackground} style={ViewStyles.r} />
            <Image source={props.subWeapon} style={[ViewStyles.transparent, styles.mask]} />
          </Center>
          <Center>
            <Circle size={30} color={Color.DarkBackground} style={ViewStyles.r} />
            <Image source={props.specialWeapon} style={[ViewStyles.transparent, styles.mask]} />
          </Center>
        </HStack>
      </HStack>
    </HStack>
  );
};

const styles = StyleSheet.create({
  mask: { width: 24, height: 24, position: "absolute" },
});

export default BattleWeaponBox;
