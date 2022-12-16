import { Image, StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";

interface StageProps {
  title: string;
  image: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stages: StageProps[];
  style?: StyleProp<ViewStyle>;
}

const ScheduleBox = (props: ScheduleBoxProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <View style={[ViewStyles.f, ViewStyles.h, props.style]}>
      <View style={[ViewStyles.f, ViewStyles.vc]}>
        <View style={[ViewStyles.mb1, ViewStyles.f, ViewStyles.hc]}>
          <Text numberOfLines={1} style={[TextStyles.b, textStyle]}>
            {props.rule}
          </Text>
          <View style={[ViewStyles.f, styles.subtitle]}>
            <Text numberOfLines={1} style={[TextStyles.subtle]}>
              {props.time}
            </Text>
          </View>
        </View>
        <View style={[ViewStyles.f, ViewStyles.hc]}>
          {props.stages.map((stage, i) => (
            <View
              key={i}
              style={[
                i !== props.stages.length - 1 ? ViewStyles.mr2 : undefined,
                ViewStyles.f,
                ViewStyles.v,
                ViewStyles.c,
              ]}
            >
              <Image
                source={{
                  uri: stage.image,
                }}
                style={[ViewStyles.mb1, ViewStyles.r, imageStyle, styles.image]}
              />
              <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
                {stage.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});

export default ScheduleBox;
