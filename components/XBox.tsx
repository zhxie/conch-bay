import { StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface XBoxProps {
  name: string;
  power?: number;
  style?: StyleProp<ViewStyle>;
}

const XBox = (props: XBoxProps) => {
  const theme = useTheme();

  return (
    <VStack flex style={props.style}>
      <VStack style={[ViewStyles.r2, ViewStyles.p2, { height: 80 }, theme.territoryStyle]}>
        <VStack flex justify>
          <VStack style={ViewStyles.mb1}>
            <Marquee
              style={[ViewStyles.mb1, TextStyles.h2, TextStyles.subtle, { color: Color.XBattle }]}
            >
              {props.name}
            </Marquee>
          </VStack>
          <HStack center>
            <Circle size={10} color={Color.XBattle} style={ViewStyles.mr1} />
            <Text numberOfLines={1} style={ViewStyles.mr1}>
              {props.power ?? "-"}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default XBox;
