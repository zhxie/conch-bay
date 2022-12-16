import { StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { TextStyles, ViewStyles } from "./Styles";

interface ScheduleButtonProps {
  rule: string;
  stages: string[];
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const ScheduleButton = (props: ScheduleButtonProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return (
    <Pressable
      style={[ViewStyles.r, ViewStyles.p2, { width: 160, height: 80 }, props.style]}
      onPress={props.onPress}
    >
      <View style={[ViewStyles.f, ViewStyles.v]}>
        <View style={[ViewStyles.hc, ViewStyles.mb2]}>
          {props.rule.length > 0 && (
            <View
              style={[
                ViewStyles.mr2,
                styles.circle,
                props.color !== undefined && { backgroundColor: props.color },
              ]}
            />
          )}
          <Text
            numberOfLines={1}
            style={[
              TextStyles.h2,
              TextStyles.subtle,
              props.color !== undefined && { color: props.color },
            ]}
          >
            {props.rule}
          </Text>
        </View>
        <View style={[ViewStyles.f, styles.stages]}>
          {props.stages
            .slice()
            .reverse()
            .map((stage, i) => (
              <Text key={i} numberOfLines={1} style={textStyle}>
                {stage}
              </Text>
            ))}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#a1a1aa",
  },
  stages: {
    flexDirection: "column-reverse",
  },
});

export default ScheduleButton;
