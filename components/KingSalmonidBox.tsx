import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Circle } from "./Shape";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
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
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <VStack style={[ViewStyles.r2, ViewStyles.p2, { width: 110, height: 80 }, style, props.style]}>
      <VStack flex justify>
        <Text
          numberOfLines={1}
          style={[
            ViewStyles.mb2,
            TextStyles.h2,
            TextStyles.subtle,
            !!props.color && { color: props.color },
          ]}
        >
          {props.name}
        </Text>
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
