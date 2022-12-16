import { StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { TextStyles, ViewStyles } from "./Styles";

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
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;
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
        <View style={ViewStyles.hc}>
          <Text numberOfLines={1} style={[ViewStyles.mr1, textStyle, waveStyle]}>
            {props.wave}
          </Text>
          <Text numberOfLines={1} style={textStyle}>
            {props.hazardLevel}
          </Text>
        </View>
      }
      style={props.style}
      onPress={props.onPress}
    >
      {props.result !== undefined && (
        <View style={ViewStyles.hc}>
          <View style={[ViewStyles.mr1, styles.circle, { backgroundColor: "gold" }]} />
          <Text numberOfLines={1} style={[ViewStyles.mr1, TextStyles.p, textStyle]}>
            {goldenCount}
          </Text>
          <View style={[ViewStyles.mr1, styles.circle, { backgroundColor: "salmon" }]} />
          <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
            {props.deliverCount}
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

export default CoopButton;
