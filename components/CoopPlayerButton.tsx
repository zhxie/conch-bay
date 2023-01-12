import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface CoopPlayerButtonProps {
  isFirst?: boolean;
  isLast?: boolean;
  name: string;
  subtitle: string;
  deliverGoldenEgg: number;
  assistGoldenEgg: number;
  powerEgg: number;
  rescue: number;
  rescued: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const CoopPlayerButton = (props: CoopPlayerButtonProps) => {
  const assistGoldenEgg = props.assistGoldenEgg! > 0 ? `+${props.assistGoldenEgg}` : "";

  return (
    <ResultButton
      isFirst={props.isFirst}
      isLast={props.isLast}
      title={props.name}
      subtitle={props.subtitle}
      style={props.style}
      onPress={props.onPress}
    >
      <HStack center>
        <Circle size={10} color={Color.GoldenEgg} style={ViewStyles.mr1} />
        <HStack style={[ViewStyles.mr1, { alignItems: "baseline" }]}>
          <Text numberOfLines={1}>{props.deliverGoldenEgg}</Text>
          <Text numberOfLines={1} style={TextStyles.h6}>
            {assistGoldenEgg}
          </Text>
        </HStack>
        <Circle size={10} color={Color.PowerEgg} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.powerEgg}
        </Text>
        <Circle size={10} color={Color.KillAndRescue} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.rescue}
        </Text>
        <Circle size={10} color={Color.Death} style={ViewStyles.mr1} />
        <Text numberOfLines={1}>{props.rescued}</Text>
      </HStack>
    </ResultButton>
  );
};

export default CoopPlayerButton;
