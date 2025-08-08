import Marquee from "./Marquee";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, useTheme, ViewStyles } from "./Styles";
import Text from "./Text";

interface XBoxProps {
  first?: boolean;
  last?: boolean;
  name: string;
  power: string;
}

const XBox = (props: XBoxProps) => {
  const theme = useTheme();

  return (
    <VStack
      style={[
        ViewStyles.wf,
        ViewStyles.px3,
        { height: 48 },
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        theme.territoryStyle,
      ]}
    >
      <VStack
        flex
        style={[ViewStyles.py2, !props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
      >
        <HStack flex center justify>
          <HStack center style={ViewStyles.mr1}>
            <Marquee style={[TextStyles.h2, TextStyles.subtle, { color: Color.XBattle }]}>
              {props.name}
            </Marquee>
          </HStack>
          <Text numberOfLines={1}>{props.power}</Text>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default XBox;
