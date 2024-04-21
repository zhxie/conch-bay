import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface WaveBoxProps {
  color?: string;
  first?: boolean;
  last?: boolean;
  isKingSalmonid?: boolean;
  waterLevel: string;
  eventWave: string;
  deliver: number;
  quota: number;
  appearance: number;
  specialWeapons: ImageSource[];
  style?: StyleProp<ViewStyle>;
}

const WaveBox = (props: WaveBoxProps) => {
  const theme = useTheme();
  const backgroundColor =
    theme.colorScheme === "light" ? `${Color.MiddleTerritory}1f` : Color.DarkBackground;

  return (
    <VStack
      style={[
        ViewStyles.wf,
        ViewStyles.px3,
        { height: props.specialWeapons.length > 0 ? 64 : 48 },
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        theme.territoryStyle,
        props.style,
      ]}
    >
      <VStack
        flex
        style={[ViewStyles.py2, !props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
      >
        <HStack flex center justify>
          <HStack center style={ViewStyles.mr1}>
            <Marquee
              style={[TextStyles.h2, TextStyles.subtle, !!props.color && { color: props.color }]}
            >
              {props.waterLevel}
            </Marquee>
          </HStack>
          <HStack flex center style={ViewStyles.mr1}>
            <Marquee>{props.eventWave}</Marquee>
          </HStack>
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
        </HStack>
        {props.specialWeapons.length > 0 && (
          <HStack flex center justify>
            <HStack flex />
            <HStack center>
              {props.specialWeapons.map((specialWeapon, i, specialWeapons) => (
                <Center key={i} style={i !== specialWeapons.length - 1 && ViewStyles.mr1}>
                  <Circle size={20} color={backgroundColor} style={ViewStyles.r1} />
                  <Image
                    source={specialWeapon}
                    style={[
                      ViewStyles.transparent,
                      { width: 15, height: 15, position: "absolute" },
                    ]}
                  />
                </Center>
              ))}
            </HStack>
          </HStack>
        )}
      </VStack>
    </VStack>
  );
};

export default WaveBox;
