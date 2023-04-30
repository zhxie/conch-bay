import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { HStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

interface WorkSuitBoxProps {
  image: ImageSource;
  name: string;
  style?: StyleProp<ViewStyle>;
}

const WorkSuitBox = (props: WorkSuitBoxProps) => {
  const theme = useTheme();

  return (
    <HStack
      style={[ViewStyles.px3, { height: 64 }, ViewStyles.r2, theme.territoryStyle, props.style]}
    >
      <HStack flex center style={[ViewStyles.py2]}>
        <Image source={props.image} style={[ViewStyles.mr3, { width: 48, height: 48 }]} />
        <HStack flex>
          <Marquee>{props.name}</Marquee>
        </HStack>
      </HStack>
    </HStack>
  );
};

export default WorkSuitBox;
