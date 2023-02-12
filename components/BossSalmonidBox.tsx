import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface BossSalmonidBoxProps {
  color?: string;
  name: string;
  defeat: number;
  teamDefeat: number;
  appearance: number;
  style?: StyleProp<ViewStyle>;
}

const BossSalmonidBox = (props: BossSalmonidBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  const defeat =
    props.defeat > 0 ? `${props.teamDefeat}(${props.defeat})` : String(props.teamDefeat);

  return (
    <VStack style={[ViewStyles.r2, ViewStyles.p2, { width: 110, height: 80 }, style, props.style]}>
      <VStack flex justify>
        <Marquee
          style={[
            ViewStyles.mb1,
            TextStyles.h2,
            TextStyles.subtle,
            !!props.color && { color: props.color },
          ]}
        >
          {props.name}
        </Marquee>
        <HStack center>
          <Circle size={10} color={Color.KillAndRescue} style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {defeat}
          </Text>
          <Circle size={10} color={Color.Special} style={ViewStyles.mr1} />
          <Text numberOfLines={1}>{props.appearance}</Text>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default BossSalmonidBox;
