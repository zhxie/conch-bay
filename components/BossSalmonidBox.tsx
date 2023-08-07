import { ColorValue, StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface BossSalmonidBoxProps {
  color?: ColorValue;
  name: string;
  defeat: number;
  teamDefeat: number;
  appearance: number;
  style?: StyleProp<ViewStyle>;
}

const BossSalmonidBox = (props: BossSalmonidBoxProps) => {
  const theme = useTheme();

  const defeat =
    props.defeat > 0 ? `${props.teamDefeat}(${props.defeat})` : String(props.teamDefeat);

  return (
    <VStack
      style={[
        ViewStyles.r2,
        ViewStyles.p2,
        { width: 110, height: 70 },
        theme.territoryStyle,
        props.style,
      ]}
    >
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
