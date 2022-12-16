import { Image, StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import { TextStyles, ViewStyles } from "./Styles";

interface StageProps {
  title: string;
  image: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stage: StageProps;
  weapons: string[];
  style?: StyleProp<ViewStyle>;
}

const ShiftBox = (props: ScheduleBoxProps) => {
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
          <View style={[ViewStyles.mr2, ViewStyles.f, ViewStyles.v, ViewStyles.c]}>
            <Image
              source={{
                uri: props.stage.image,
              }}
              style={[ViewStyles.mb1, ViewStyles.r, imageStyle, styles.stage]}
            />
            <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
              {props.stage.title}
            </Text>
          </View>
          <View style={[ViewStyles.mb1, ViewStyles.f, ViewStyles.v, ViewStyles.c]}>
            <View style={[ViewStyles.h, ViewStyles.c]}>
              {props.weapons.map((weapon, i) => (
                <Image
                  key={i}
                  source={{
                    uri: weapon,
                  }}
                  style={[
                    i !== props.weapons.length - 1 ? ViewStyles.mr1 : undefined,
                    ViewStyles.f,
                    styles.weapon,
                  ]}
                />
              ))}
            </View>
            <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
              {" "}
            </Text>
          </View>
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
  stage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  weapon: {
    width: "100%",
    aspectRatio: 1 / 1,
  },
});

export default ShiftBox;
