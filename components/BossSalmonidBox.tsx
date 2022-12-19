import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";
import { HStack, VStack } from "./Stack";
import Text from "./Text";
import { Circle } from "./Shape";
import { Color } from "../models";

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
    <VStack style={[ViewStyles.r, ViewStyles.p2, { width: 100, height: 80 }, style, props.style]}>
      <VStack flex>
        <Text
          numberOfLines={1}
          style={[
            ViewStyles.mb2,
            TextStyles.h2,
            TextStyles.subtle,
            props.color !== undefined && { color: props.color },
          ]}
        >
          {props.name}
        </Text>
        <VStack flex reverse>
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
    </VStack>
  );
};

export default BossSalmonidBox;
