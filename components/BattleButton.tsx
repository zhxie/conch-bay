import { StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { TextStyles, ViewStyles } from "./Styles";

interface BattleButtonProps {
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
  result?: number;
  rule: string;
  stage: string;
  weapon: string;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattleButton = (props: BattleButtonProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}<${props.assist}>`
      : props.kill;

  return (
    <ResultButton
      color={props.color}
      isFirst={props.isFirst}
      isLast={props.isLast}
      result={props.result}
      title={props.rule}
      subtitle={props.stage}
      subChildren={
        <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
          {props.weapon}
        </Text>
      }
      style={props.style}
      onPress={props.onPress}
    >
      {props.result !== undefined && (
        <View style={ViewStyles.hc}>
          <View style={[ViewStyles.mr1, styles.circle, { backgroundColor: "salmon" }]} />
          <Text numberOfLines={1} style={[ViewStyles.mr1, TextStyles.p, textStyle]}>
            {killAndAssist}
          </Text>
          <View style={[ViewStyles.mr1, styles.circle, { backgroundColor: "darkseagreen" }]} />
          <Text numberOfLines={1} style={[ViewStyles.mr1, TextStyles.p, textStyle]}>
            {props.death ?? "-"}
          </Text>
          <View style={[ViewStyles.mr1, styles.circle, { backgroundColor: "gold" }]} />
          <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
            {props.special ?? "-"}
          </Text>
        </View>
      )}
    </ResultButton>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default BattleButton;
