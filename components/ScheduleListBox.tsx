import { StyleProp, ViewStyle } from "react-native";
import Marquee from "./Marquee";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface ScheduleListBoxProps {
  first?: boolean;
  last?: boolean;
  title: string;
  time: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const ScheduleListBox = (props: ScheduleListBoxProps) => {
  const theme = useTheme();

  return (
    <VStack
      style={[
        theme.territoryStyle,
        ViewStyles.px3,
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        props.style,
      ]}
    >
      <VStack
        style={[ViewStyles.py2, !props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
      >
        <VStack flex>
          <HStack flex center justify style={ViewStyles.mb2}>
            <HStack flex center style={ViewStyles.mr1}>
              <HStack style={ViewStyles.i}>
                <Marquee style={TextStyles.h2}>{props.title}</Marquee>
              </HStack>
            </HStack>
            <HStack center>
              <Text numberOfLines={1} style={TextStyles.subtle}>
                {props.time}
              </Text>
            </HStack>
          </HStack>
          {props.children}
        </VStack>
      </VStack>
    </VStack>
  );
};

export default ScheduleListBox;
