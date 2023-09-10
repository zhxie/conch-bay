import { StyleProp, ViewStyle } from "react-native";
import { genericMemo } from "../utils/memo";
import ResultButton from "./ResultButton";
import { TextStyles } from "./Styles";
import Text from "./Text";

interface BattleRotationButtonProps<T> {
  stats?: T;
  color: string;
  first?: boolean;
  last?: boolean;
  rule: string;
  time: string;
  stages: string;
  style?: StyleProp<ViewStyle>;
  onPress?: (stats: T) => void;
}

const BattleRotationButton = <T,>(props: BattleRotationButtonProps<T>) => {
  const onPress = () => {
    if (props.stats && props.onPress) {
      props.onPress(props.stats);
    }
  };

  return (
    <ResultButton
      color={props.color}
      first={props.first}
      last={props.last}
      title={props.rule}
      subtitle={props.stages}
      subChildren={
        <Text numberOfLines={1} style={TextStyles.subtle}>
          {props.time}
        </Text>
      }
      style={props.style}
      onPress={onPress}
    />
  );
};

export default genericMemo(BattleRotationButton);
