import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack } from "./Stack";
import { Circle } from "./Shape";
import { Color } from "../models";

interface BattlePlayerButtonProps {
  isFirst?: boolean;
  isLast?: boolean;
  name: string;
  weapon: string;
  paint: number;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattlePlayerButton = (props: BattlePlayerButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}<${props.assist}>`
      : props.kill;

  return (
    <ResultButton
      isFirst={props.isFirst}
      isLast={props.isLast}
      title={props.name}
      subtitle={`${props.paint} pt`}
      subChildren={<Text numberOfLines={1}>{props.weapon}</Text>}
      style={props.style}
      onPress={props.onPress}
    >
      <HStack center>
        <Circle size={10} color={Color.KillAndSave} style={ViewStyles.mr1} />
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
