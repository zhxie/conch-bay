import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface WaveBoxProps {
  color?: string;
  isKingSalmonid?: boolean;
  waterLevel: string;
  eventWave: string;
  deliver: number;
  quota: number;
  appearance: number;
  style?: StyleProp<ViewStyle>;
}

const WaveBox = (props: WaveBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <VStack style={[ViewStyles.r, ViewStyles.p2, { width: 125, height: 90 }, style, props.style]}>
      <VStack flex justify>
        <VStack style={ViewStyles.mb2}>
          <Text
            numberOfLines={1}
            style={[
              ViewStyles.mb1,
              TextStyles.h2,
              TextStyles.subtle,
              !!props.color && { color: props.color },
            ]}
          >
            {props.waterLevel}
          </Text>
          <Text numberOfLines={1} style={ViewStyles.mb2}>
            {props.eventWave}
          </Text>
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
  );
};

export default WaveBox;
