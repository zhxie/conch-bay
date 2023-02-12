import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import Marquee from "./Marquee";
import { HStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";

interface DisplayProps {
  isFirst?: boolean;
  isLast?: boolean;
  title: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const Display = (props: DisplayProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <HStack
      style={[
        ViewStyles.px3,
        { height: 32 },
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        style,
        props.style,
      ]}
    >
      <HStack
        flex
        center
        justify
        style={[!props.isFirst && ViewStyles.sept, !props.isLast && ViewStyles.sepb]}
      >
        <HStack flex center style={ViewStyles.mr1}>
          <Marquee style={TextStyles.b}>{props.title}</Marquee>
        </HStack>
        <HStack center>{props.children}</HStack>
      </HStack>
    </HStack>
  );
};

export default Display;
