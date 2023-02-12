import { StyleProp, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface SpecialWeaponProps {
  use: number;
  used: number;
}
interface WaveBoxProps {
  color?: string;
  isKingSalmonid?: boolean;
  waterLevel: string;
  eventWave: string;
  deliver: number;
  quota: number;
  appearance: number;
  specialWeapons: SpecialWeaponProps[];
  specialWeaponSupplied: number;
  style?: StyleProp<ViewStyle>;
}

const WaveBox = (props: WaveBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;
  const color = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;

  return (
    <VStack flex center style={props.style}>
      <VStack
        style={[ViewStyles.mb1, ViewStyles.r2, ViewStyles.p2, { width: 125, height: 90 }, style]}
      >
        <VStack flex justify>
          <VStack style={ViewStyles.mb1}>
            <Marquee
              style={[
                ViewStyles.mb1,
                TextStyles.h2,
                TextStyles.subtle,
                !!props.color && { color: props.color },
              ]}
            >
              {props.waterLevel}
            </Marquee>
            <Marquee style={ViewStyles.mb2}>{props.eventWave}</Marquee>
          </VStack>
          <HStack center>
            <Circle
              size={10}
              color={props.isKingSalmonid ? Color.KillAndRescue : Color.GoldenEgg}
              style={ViewStyles.mr1}
            />
            <Text numberOfLines={1} style={ViewStyles.mr1}>
              {`${props.deliver} / ${props.quota}`}
            </Text>
            <Circle size={10} color={Color.Special} style={ViewStyles.mr1} />
            <Text numberOfLines={1}>{props.appearance}</Text>
          </HStack>
        </VStack>
      </VStack>
      <HStack>
        {new Array(props.specialWeapons.length).fill(0).map((_, i) => {
          return (
            <HStack key={i} style={ViewStyles.px1}>
              {new Array(props.specialWeaponSupplied).fill(0).map((_, j) => (
                <Center key={j} style={ViewStyles.px0_25}>
                  <Center
                    style={[
                      styles.specialWeapon,
                      {
                        backgroundColor: color,
                      },
                    ]}
                  >
                    <Center
                      style={[
                        styles.specialWeapon,
                        {
                          backgroundColor:
                            j < props.specialWeapons[i].used
                              ? `${Color.Special}5f`
                              : j < props.specialWeapons[i].use
                              ? Color.Special
                              : undefined,
                        },
                      ]}
                    />
                  </Center>
                </Center>
              ))}
            </HStack>
          );
        })}
      </HStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  specialWeapon: {
    width: 6,
    height: 4,
    borderRadius: 2,
  },
});

export default WaveBox;
