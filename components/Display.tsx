import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { HStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

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
        props.isFirst && ViewStyles.rt,
        props.isLast && ViewStyles.rb,
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
          <Text numberOfLines={1} style={TextStyles.b}>
            {props.title}
          </Text>
        </HStack>
        <HStack center>{props.children}</HStack>
      </HStack>
    </HStack>
  );
};

export default Display;
