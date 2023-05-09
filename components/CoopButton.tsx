import { createContext, memo, useContext } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Icon from "./Icon";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

const CoopButtonContext = createContext({ grade: false, changeGrade: () => {} });

interface CoopButtonProps {
  coop?: any;
  color: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  self?: string;
  result?: number;
  rule: string;
  stage: string;
  kingSalmonid?: string;
  wave: string;
  isClear: boolean;
  hazardLevel: string;
  grade?: string;
  gradePoint: number;
  gradeChange: number;
  goldenEgg: number;
  powerEgg: number;
  style?: StyleProp<ViewStyle>;
  onPress?: (coop: any) => void;
}

const CoopButton = (props: CoopButtonProps) => {
  const context = useContext(CoopButtonContext);

  const theme = useTheme();

  const clearStyle = [TextStyles.b, { color: props.color }];
  const waveStyle = props.isClear ? clearStyle : undefined;

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
      self={props.self}
      result={props.result}
      title={props.rule}
      subtitle={
        props.kingSalmonid !== undefined
          ? `${props.stage} / ${props.kingSalmonid}`
          : `${props.stage}`
      }
      subChildren={
        <Text
          numberOfLines={1}
          onPress={props.grade && props.hazardLevel ? context.changeGrade : undefined}
        >
          {(context.grade && props.grade) || !props.hazardLevel ? (
            props.grade ? (
              <Text numberOfLines={1} style={props.gradeChange > 0 ? clearStyle : undefined}>
                <Icon
                  name={
                    props.gradeChange > 0
                      ? "arrow-up"
                      : props.gradeChange === 0
                      ? "arrow-right"
                      : "arrow-down"
                  }
                  size={14}
                  color={props.gradeChange > 0 ? props.color : theme.textColor}
                />
                {` ${props.grade} ${props.gradePoint}`}
              </Text>
            ) : undefined
          ) : (
            <Text numberOfLines={1} style={waveStyle}>
              {props.wave}
            </Text>
          )}
          <Text numberOfLines={1}>{props.hazardLevel ? ` ${props.hazardLevel}` : ""}</Text>
        </Text>
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

export { CoopButtonContext };
export default memo(CoopButton);
