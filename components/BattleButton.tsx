import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface BattleButtonProps {
  color: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  result?: number;
  rule: string;
  dragon?: string;
  stage: string;
  weapon: string;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number | null;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattleButton = (props: BattleButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}(${props.assist})`
      : props.kill;

  return (
    <ResultButton
      color={props.color}
      isLoading={props.isLoading}
      isFirst={props.isFirst}
      isLast={props.isLast}
      result={props.result}
      title={props.rule}
      badge={props.dragon}
      subtitle={props.stage}
      subChildren={<Text numberOfLines={1}>{props.weapon}</Text>}
      style={props.style}
      onPress={props.onPress}
    >
      {props.result !== undefined && (
        <HStack center>
          {props.ultraSignal !== undefined && props.ultraSignal !== null && (
            <HStack center style={ViewStyles.mr1}>
              <Circle size={10} color={Color.UltraSignal} style={ViewStyles.mr1} />
              <Text numberOfLines={1}>{props.ultraSignal}</Text>
            </HStack>
          )}
          <Circle size={10} color={Color.KillAndRescue} style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {killAndAssist}
          </Text>
          <Circle size={10} color={Color.Death} style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {props.death ?? "-"}
          </Text>
          <Circle size={10} color={Color.Special} style={ViewStyles.mr1} />
          <Text numberOfLines={1}>{props.special ?? "-"}</Text>
        </HStack>
      )}
    </ResultButton>
  );
};

export default BattleButton;
