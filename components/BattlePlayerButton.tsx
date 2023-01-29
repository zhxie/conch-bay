import { StyleProp, ViewStyle } from "react-native";
import { SourceProps } from "./Image";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface BattlePlayerButtonProps {
  isFirst?: boolean;
  isLast?: boolean;
  name: string;
  weapon: SourceProps;
  paint: number;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number | null;
  crown?: boolean;
  dragon?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattlePlayerButton = (props: BattlePlayerButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}(${props.assist})`
      : props.kill;

  return (
    <ResultButton
      color={props.crown ? Color.AnarchyBattle : props.dragon}
      isFirst={props.isFirst}
      isLast={props.isLast}
      image={props.weapon}
      icon={props.crown ? "crown" : props.dragon ? "party-popper" : undefined}
      title={props.name}
      subtitle={`${props.paint} pt`}
      style={props.style}
      onPress={props.onPress}
    >
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
    </ResultButton>
  );
};

export default BattlePlayerButton;
