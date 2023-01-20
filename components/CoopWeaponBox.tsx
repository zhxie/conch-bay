import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import Image, { SourceProps } from "./Image";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";

interface BattleWeaponBoxProps {
  mainWeapons: SourceProps[];
  specialWeapon: SourceProps;
  style?: StyleProp<ViewStyle>;
}

const BattleWeaponBox = (props: BattleWeaponBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <HStack
      style={[ViewStyles.px3, ViewStyles.py2, { height: 48 }, ViewStyles.r, style, props.style]}
    >
      <HStack flex center justify>
        <HStack center style={ViewStyles.mr1}>
          {props.mainWeapons.map((weapon, i, weapons) => (
            <Image
              source={weapon}
              style={[
                i === weapons.length - 1 ? undefined : ViewStyles.mr1,
                { width: 32, height: 32 },
              ]}
            />
          ))}
        </HStack>
        <Center>
          <Circle size={25} color={Color.DarkBackground} style={ViewStyles.r} />
          <Image
            source={props.specialWeapon}
            style={[
              ViewStyles.transparent,
              { width: 19, height: 19, position: "absolute", left: 3, top: 3 },
            ]}
          />
        </Center>
      </HStack>
    </HStack>
  );
};

export default BattleWeaponBox;
