import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface WaveBoxProps {
  color?: string;
  isKingSalmonid?: boolean;
  waterLevel: string;
  eventWave: string;
  deliver: number;
  quota: number;
  appearance: number;
  specialWeapons: ImageSource[];
  paddingTo: number;
  style?: StyleProp<ViewStyle>;
}

const WaveBox = (props: WaveBoxProps) => {
  const theme = useTheme();

  const specialWeaponPerRow = props.paddingTo <= 5 ? 5 : 4;
  const specialWeaponRow = Math.floor(
    (props.specialWeapons.length + (specialWeaponPerRow - 1)) / specialWeaponPerRow
  );
  const maxSpecialWeaponRow = Math.floor(
    (props.paddingTo + (specialWeaponPerRow - 1)) / specialWeaponPerRow
  );

  return (
    <VStack center style={[{ width: 125 }, props.style]}>
      <VStack
        style={[
          ViewStyles.wf,
          ViewStyles.mb1,
          ViewStyles.r2,
          ViewStyles.p2,
          { height: 90 },
          theme.territoryStyle,
        ]}
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
      {/* HACK: add a mb1 in each row. */}
      <VStack center style={{ height: 20 * maxSpecialWeaponRow + 4 * (maxSpecialWeaponRow - 1) }}>
        {new Array(specialWeaponRow).fill(0).map((_, i) => (
          <HStack key={i} style={i !== specialWeaponRow - 1 && ViewStyles.mb1}>
            {new Array(
              Math.min(props.specialWeapons.length - i * specialWeaponPerRow, specialWeaponPerRow)
            )
              .fill(0)
              .map((_, j, row) => (
                <Center key={j} style={j !== row.length - 1 && ViewStyles.mr1}>
                  <Circle size={20} color={theme.territoryColor} style={ViewStyles.r1} />
                  <Image
                    source={props.specialWeapons[i * specialWeaponPerRow + j]}
                    style={[
                      ViewStyles.transparent,
                      { width: 15, height: 15, position: "absolute" },
                    ]}
                  />
                </Center>
              ))}
          </HStack>
        ))}
      </VStack>
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
