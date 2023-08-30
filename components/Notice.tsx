import { StyleProp, ViewStyle } from "react-native";
import Icon from "./Icon";
import Marquee from "./Marquee";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

interface NoticeProps {
  title: string;
  styles?: StyleProp<ViewStyle>;
}

const Notice = (props: NoticeProps) => {
  return (
    <HStack style={[ViewStyles.c, props.styles]}>
      <Icon name="info" size={14} color={Color.MiddleTerritory} style={ViewStyles.mr1} />
      <HStack style={ViewStyles.i}>
        <Marquee style={TextStyles.subtle}>{props.title}</Marquee>
      </HStack>
    </HStack>
  );
};

export default Notice;
