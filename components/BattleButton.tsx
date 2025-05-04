import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { genericMemo } from "../utils/memo";
import ResultButton, { Result } from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface BattleButtonProps {
  id?: string;
  color: string;
  first?: boolean;
  last?: boolean;
  tag?: string;
  result?: Result;
  rule: string;
  dragon?: string;
  stage: string;
  weapon: string;
  power?: string;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: (id: string) => void;
}

const BattleButton = (props: BattleButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
        ? `${props.kill}(${props.assist})`
        : props.kill;

  const onPress = () => {
    if (props.id && props.onPress) {
      props.onPress(props.id);
    }
  };

  return (
    <ResultButton
      color={props.color}
      first={props.first}
      last={props.last}
      tag={props.tag}
      result={props.result}
      title={props.rule}
      badge={props.dragon}
      subtitle={props.stage}
      subChildren={
        <Text numberOfLines={1}>{`${props.weapon}${
          props.power !== undefined ? ` (${props.power})` : ""
        }`}</Text>
      }
      style={props.style}
      onPress={onPress}
    >
      {props.result !== undefined && (
        <HStack center>
          {props.ultraSignal !== undefined && (
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

export default genericMemo(BattleButton);
