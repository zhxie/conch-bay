import { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
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
  specialWeaponPadding: boolean;
  style?: StyleProp<ViewStyle>;
}

const WaveBox = (props: WaveBoxProps) => {
  const theme = useTheme();

  const specialWeapons = useMemo(() => {
    const result: { image: ImageSource; count: number }[] = [];
    const map = new Map<string, number>();
    for (const specialWeapon of props.specialWeapons) {
      let i = map.get(specialWeapon.uri!);
      if (i === undefined) {
        result.push({ image: specialWeapon, count: 0 });
        map.set(specialWeapon.uri!, result.length - 1);
        i = map.get(specialWeapon.uri!)!;
      }
      result[i].count += 1;
    }
    return result;
  }, [props.specialWeapons]);
  const overlapping = useMemo(() => {
    const basic =
      20 * specialWeapons.length + ViewStyles.mr1.marginRight * (specialWeapons.length - 1);
    const extraCount = specialWeapons.reduce((prev, current) => prev + current.count - 1, 0);
    const each = (125 - basic) / extraCount;
    if (each > 20 + ViewStyles.mr1.marginRight) {
      return 0;
    } else {
      return Math.ceil(20 + ViewStyles.mr1.marginRight - each);
    }
  }, [specialWeapons]);

  return (
    <VStack center style={[{ width: 125 }, props.style]}>
      <VStack
        style={[
          ViewStyles.wf,
          props.specialWeaponPadding && ViewStyles.mb1,
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
      {props.specialWeaponPadding && (
        <HStack style={{ height: 20 }}>
          {specialWeapons.map((specialWeapon, i, specialWeapons) => (
            <HStack key={i} style={i !== specialWeapons.length - 1 && ViewStyles.mr1}>
              {new Array(specialWeapon.count).fill(0).map((_, j) => (
                <Center
                  key={j}
                  style={[
                    j !== 0 && {
                      marginLeft: 3 - overlapping,
                      // HACK: the margin is consisted of a 1 border and a 3 margin.
                      borderLeftWidth: 1,
                      borderLeftColor: theme.backgroundColor,
                    },
                  ]}
                >
                  <Circle size={20} color={theme.territoryColor} style={ViewStyles.r1} />
                  <Image
                    source={specialWeapon.image}
                    style={[
                      ViewStyles.transparent,
                      // HACK: have to designate a left value to avoid offset by border.
                      { width: 15, height: 15, position: "absolute", left: 2.5 },
                    ]}
                  />
                </Center>
              ))}
              {/* An extra background to avoid display error when overlapping with radius and border. */}
              {specialWeapon.count > 1 && overlapping > 3 && (
                <Center
                  style={[
                    theme.territoryStyle,
                    ViewStyles.r1,
                    {
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      zIndex: -1,
                    },
                  ]}
                />
              )}
            </HStack>
          ))}
        </HStack>
      )}
    </VStack>
  );
};

export default WaveBox;
