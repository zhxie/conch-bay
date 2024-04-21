import { StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface EmptyBossSalmonidBoxProps {
  firstRow: boolean;
  lastRow: boolean;
  firstColumn: boolean;
  lastColumn: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const EmptyBossSalmonidBox = (props: EmptyBossSalmonidBoxProps) => {
  const theme = useTheme();

  return (
    <VStack
      flex
      style={[
        props.firstRow && props.firstColumn && ViewStyles.rtl2,
        props.firstRow && props.lastColumn && ViewStyles.rtr2,
        props.lastRow && props.firstColumn && ViewStyles.rbl2,
        props.lastRow && props.lastColumn && ViewStyles.rbr2,
        theme.territoryStyle,
        props.style,
      ]}
    >
      <VStack
        flex
        style={[
          props.firstRow && ViewStyles.pt2,
          props.lastRow && ViewStyles.pb2,
          props.firstColumn && ViewStyles.pl2,
          props.lastColumn && ViewStyles.pr2,
        ]}
      >
        <VStack
          flex
          center
          justify
          style={[
            !props.firstRow && ViewStyles.pt2,
            !props.lastRow && ViewStyles.pb2,
            !props.firstColumn && ViewStyles.pl2,
            !props.lastColumn && ViewStyles.pr2,
            !props.firstRow && ViewStyles.sept,
            !props.lastRow && ViewStyles.sepb,
            !props.firstColumn && ViewStyles.sepl,
            !props.lastColumn && ViewStyles.sepr,
          ]}
        >
          {props.children}
        </VStack>
      </VStack>
    </VStack>
  );
};

interface BossSalmonidBoxProps extends EmptyBossSalmonidBoxProps {
  firstRow: boolean;
  lastRow: boolean;
  firstColumn: boolean;
  lastColumn: boolean;
  color?: string;
  name: string;
  defeat: number;
  teamDefeat: number;
  appearance: number;
  style?: StyleProp<ViewStyle>;
}

const BossSalmonidBox = (props: BossSalmonidBoxProps) => {
  const { color, name, defeat, teamDefeat, appearance, ...rest } = props;

  const formattedDefeat = defeat > 0 ? `${teamDefeat}(${defeat})` : String(teamDefeat);

  return (
    <EmptyBossSalmonidBox {...rest}>
      <Marquee
        style={[ViewStyles.mb2, TextStyles.h2, TextStyles.subtle, !!color && { color: color }]}
      >
        {name}
      </Marquee>
      <HStack center>
        <Text numberOfLines={1}>
          {formattedDefeat} / {appearance}
        </Text>
      </HStack>
    </EmptyBossSalmonidBox>
  );
};

export { EmptyBossSalmonidBox };
export default BossSalmonidBox;
