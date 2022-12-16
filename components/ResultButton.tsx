import { Feather } from "@expo/vector-icons";
import { StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from "react-native";
import { Color } from "../models";
import Pressable from "./Pressable";
import { TextStyles, ViewStyles } from "./Styles";

interface ResultButtonProps {
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
  result?: number;
  title: string;
  subtitle: string;
  subChildren?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
}

const ResultButton = (props: ResultButtonProps) => {
  const colorScheme = useColorScheme();
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  return (
    <Pressable
      style={[
        ViewStyles.px3,
        ViewStyles.py2,
        { height: 64 },
        props.isFirst && ViewStyles.rt,
        props.isLast && ViewStyles.rb,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <View style={[ViewStyles.f, ViewStyles.hc]}>
        <View style={[ViewStyles.mr3, ViewStyles.c, { width: 32, height: 32 }]}>
          {props.result !== undefined &&
            (() => {
              if (props.result > 0) {
                return <Feather name="circle" size={28} color={props.color} />;
              } else if (props.result === 0) {
                return <Feather name="minus" size={32} color={Color.MiddleTerritory} />;
              } else {
                return <Feather name="x" size={32} color={Color.MiddleTerritory} />;
              }
            })()}
        </View>
        <View style={[ViewStyles.f, ViewStyles.vc]}>
          <View style={[ViewStyles.f, ViewStyles.hc]}>
            <Text numberOfLines={1} style={[TextStyles.h2, { color: props.color }]}>
              {props.title}
            </Text>
            <View style={[ViewStyles.f, styles.children]}>{props.subChildren}</View>
          </View>
          <View style={[ViewStyles.f, ViewStyles.hc]}>
            <Text numberOfLines={1} style={[TextStyles.p, textStyle]}>
              {props.subtitle}
            </Text>
            <View style={[ViewStyles.f, styles.children]}>{props.children}</View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  children: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
});

export default ResultButton;
