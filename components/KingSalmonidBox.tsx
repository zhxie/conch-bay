import { StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface KingSalmonidBoxProps {
  color?: string;
  name: string;
  bronzeScale: number;
  silverScale: number;
  goldScale: number;
  style?: StyleProp<ViewStyle>;
}

const KingSalmonidBox = (props: KingSalmonidBoxProps) => {
  const theme = useTheme();

  return (
    <VStack
      style={[
        ViewStyles.r2,
        ViewStyles.p2,
        { width: 110, height: 80 },
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
        <VStack>
          <HStack center>
            <Circle size={10} color={Color.BronzeScale} style={ViewStyles.mr1} />
            <Text numberOfLines={1} style={ViewStyles.mr1}>
              {props.bronzeScale}
            </Text>
            <Circle size={10} color={Color.SilverScale} style={ViewStyles.mr1} />
            <Text numberOfLines={1} style={ViewStyles.mr1}>
              {props.silverScale}
            </Text>
            <Circle size={10} color={Color.GoldScale} style={ViewStyles.mr1} />
            <Text numberOfLines={1}>{props.goldScale}</Text>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default KingSalmonidBox;
