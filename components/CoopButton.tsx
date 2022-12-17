import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack } from "./Stack";
import { Circle } from "./Shape";

interface CoopButtonProps {
  color: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  result?: number;
  rule: string;
  stage: string;
  wave: string;
  isWaveClear: boolean;
  hazardLevel: string;
  deliverCount: number;
  goldenAssistCount: number;
  goldenDeliverCount: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const CoopButton = (props: CoopButtonProps) => {
  const waveStyle = props.isWaveClear ? [TextStyles.b, { color: props.color }] : undefined;

  const goldenCount =
    props.goldenAssistCount! > 0
      ? `${props.goldenDeliverCount}<${props.goldenAssistCount}>`
      : props.goldenDeliverCount;

  return (
    <ResultButton
      color={props.color}
      isLoading={props.isLoading}
      isFirst={props.isFirst}
      isLast={props.isLast}
      result={props.result}
      title={props.rule}
      subtitle={props.stage}
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
          <Circle size={10} color="gold" style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {goldenCount}
          </Text>
          <Circle size={10} color="salmon" style={ViewStyles.mr1} />
          <Text numberOfLines={1}>{props.deliverCount}</Text>
        </HStack>
      )}
    </ResultButton>
  );
};

export default CoopButton;
