import { StyleProp, ViewStyle } from "react-native";
import { genericMemo } from "../utils/memo";
import Icon from "./Icon";
import ResultButton, { Result } from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface CoopButtonProps<T> {
  coop?: T;
  color: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  tag?: string;
  result?: Result;
  rule: string;
  stage: string;
  kingSalmonid?: string;
  isClear: boolean;
  hazardLevel: string;
  info: string;
  gradeChange?: Result;
  goldenEgg: number;
  powerEgg: number;
  style?: StyleProp<ViewStyle>;
  onPress?: (coop: T) => void;
}

const CoopButton = <T extends any>(props: CoopButtonProps<T>) => {
  const theme = useTheme();

  const clearStyle = [TextStyles.b, { color: props.color }];

  const onPress = () => {
    if (props.coop && props.onPress) {
      props.onPress(props.coop);
    }
  };

  return (
    <ResultButton
      color={props.color}
      isLoading={props.isLoading}
      isFirst={props.isFirst}
      isLast={props.isLast}
      tag={props.tag}
      result={props.result}
      title={props.rule}
      subtitle={
        props.kingSalmonid !== undefined ? (
          <Text>
            {props.stage} /{" "}
            <Text style={props.isClear ? clearStyle : undefined}>{props.kingSalmonid}</Text>
          </Text>
        ) : (
          `${props.stage}`
        )
      }
      subChildren={
        <HStack center>
          {props.gradeChange !== undefined && (
            <Icon
              name={(() => {
                switch (props.gradeChange) {
                  case Result.Win:
                    return "arrow-up";
                  case Result.Draw:
                    return "arrow-right";
                  case Result.Lose:
                    return "arrow-down";
                  case Result.ExemptedLose:
                    throw new Error(`unexpected gradeChange ${props.gradeChange}`);
                }
              })()}
              size={14}
              color={props.gradeChange === Result.Win ? props.color : theme.textColor}
              style={props.info.length > 0 ? ViewStyles.mr0_5 : undefined}
            />
          )}
          <Text>
            {props.info.length > 0 && (
              <Text
                numberOfLines={1}
                style={(props.result ?? Result.Lose) === Result.Win ? clearStyle : undefined}
              >
                {props.info}
              </Text>
            )}
            {props.hazardLevel.length > 0 && (
              <Text numberOfLines={1}>
                {props.info.length > 0 ? ` (${props.hazardLevel})` : props.hazardLevel}
              </Text>
            )}
          </Text>
        </HStack>
      }
      style={props.style}
      onPress={onPress}
    >
      {props.result !== undefined && (
        <HStack center>
          <Circle size={10} color={Color.GoldenEgg} style={ViewStyles.mr1} />
          <Text numberOfLines={1} style={ViewStyles.mr1}>
            {props.goldenEgg}
          </Text>
          <Circle size={10} color={Color.PowerEgg} style={ViewStyles.mr1} />
          <Text numberOfLines={1}>{props.powerEgg}</Text>
        </HStack>
      )}
    </ResultButton>
  );
};

export default genericMemo(CoopButton);
