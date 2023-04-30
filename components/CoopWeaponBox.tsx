import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles, useTheme } from "./Styles";

interface BattleWeaponBoxProps {
  mainWeapons: ImageSource[];
  specialWeapon: ImageSource;
  style?: StyleProp<ViewStyle>;
}

const BattleWeaponBox = (props: BattleWeaponBoxProps) => {
  const theme = useTheme();

  return (
    <HStack
      style={[
        ViewStyles.px3,
        ViewStyles.py2,
        { height: 48 },
        ViewStyles.r2,
        theme.territoryStyle,
        props.style,
      ]}
    >
      <HStack flex center justify>
        <HStack center style={ViewStyles.mr1}>
          {props.mainWeapons.map((weapon, i, weapons) => (
            <Image
              key={i}
              source={weapon}
              style={[
                i === weapons.length - 1 ? undefined : ViewStyles.mr1,
                { width: 32, height: 32 },
              ]}
            />
          ))}
        </HStack>
        <Center>
          <Circle size={25} color={Color.DarkBackground} style={ViewStyles.r2} />
          <Image
            source={props.specialWeapon}
            style={[ViewStyles.transparent, { width: 19, height: 19, position: "absolute" }]}
          />
        </Center>
      </HStack>
    </HStack>
  );
};

export default BattleWeaponBox;
