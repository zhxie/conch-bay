import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack } from "./Stack";
import { Circle } from "./Shape";
import { Color } from "../models";

interface CoopButtonProps {
  color: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  result?: number;
  rule: string;
  stage: string;
  kingSalmonid?: string;
  wave: string;
  isClear: boolean;
  hazardLevel: string;
  deliverGoldenEgg: number;
  assistGoldenEgg: number;
  powerEgg: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const CoopButton = (props: CoopButtonProps) => {
  const waveStyle = props.isClear ? [TextStyles.b, { color: props.color }] : undefined;

  const subtitle =
    props.kingSalmonid !== undefined ? `${props.stage} / ${props.kingSalmonid}` : `${props.stage}`;
  const goldenEgg =
    props.assistGoldenEgg! > 0
      ? `${props.deliverGoldenEgg}<${props.assistGoldenEgg}>`
      : props.deliverGoldenEgg;

  return (
    <ResultButton
      color={props.color}
      isLoading={props.isLoading}
      isFirst={props.isFirst}
      isLast={props.isLast}
      result={props.result}
      title={props.rule}
      subtitle={subtitle}
      subChildren={
        <HStack center>
          <Text numberOfLines={1} style={[ViewStyles.mr1, waveStyle]}>
            {props.wave}
          </Text>
          <Text numberOfLines={1}>{props.hazardLevel}</Text>
        </HStack>
      }
      style={props.style}
      onPress={props.onPress}
    >
      {props.result !== undefined && (
        <HStack center>
          <Circle size={10} color={Color.GoldenEgg} style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {goldenEgg}
          </Text>
          <Circle size={10} color={Color.PowerEgg} style={ViewStyles.mr1} />
          <Text numberOfLines={1}>{props.powerEgg}</Text>
        </HStack>
      )}
    </ResultButton>
  );
};

export default CoopButton;
