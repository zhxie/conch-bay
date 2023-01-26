import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import Image, { SourceProps } from "./Image";
import { HStack } from "./Stack";
import { ViewStyles } from "./Styles";
import Text from "./Text";

interface WorkSuitBoxProps {
  image: SourceProps;
  name: string;
  style?: StyleProp<ViewStyle>;
}

const WorkSuitBox = (props: WorkSuitBoxProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <HStack style={[ViewStyles.px3, { height: 64 }, ViewStyles.r2, style, props.style]}>
      <HStack flex center style={[ViewStyles.py2]}>
        <Image source={props.image} style={[ViewStyles.mr3, { width: 48, height: 48 }]} />
        <Text numberOfLines={1}>{props.name}</Text>
      </HStack>
    </HStack>
  );
};

export default WorkSuitBox;
