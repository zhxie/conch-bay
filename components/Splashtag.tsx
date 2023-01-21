import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Image, { SourceProps } from "./Image";
import { Center, HStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface SplashtagProps {
  color: string;
  name: string;
  nameId: string;
  title: string;
  banner: SourceProps;
  badges: (SourceProps | null)[];
  style?: StyleProp<ViewStyle>;
}

const Splashtag = (props: SplashtagProps) => {
  return (
    <Center flex style={props.style}>
      <Image
        source={props.banner}
        style={[ViewStyles.r, { width: "100%", aspectRatio: 700 / 200 }]}
      />
      <HStack center style={{ height: "35%", position: "absolute", right: 1, bottom: 1 }}>
        {props.badges.map((badge, i, badges) => {
          if (badge) {
            return (
              <Image
                key={i}
                source={badge}
                style={[
                  i === badges.length - 1 ? undefined : ViewStyles.mr0_5,
                  styles.badge,
                  { backgroundColor: "transparent" },
                ]}
              />
            );
          } else {
            return (
              <View
                key={i}
                style={[i === badges.length - 1 ? undefined : ViewStyles.mr0_5, styles.badge]}
              />
            );
          }
        })}
      </HStack>
      <Text
        numberOfLines={1}
        style={[
          TextStyles.h5,
          {
            position: "absolute",
            left: 10,
            top: 5,
            color: props.color,
            transform: [{ skewX: "-5deg" }],
          },
        ]}
      >
        {props.title}
      </Text>
      <Text
        numberOfLines={1}
        style={[TextStyles.h7, { position: "absolute", left: 10, bottom: 5, color: props.color }]}
      >
        {`#${props.nameId}`}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          TextStyles.h0,
          { position: "absolute", color: props.color, fontFamily: "Splatfont" },
        ]}
      >
        {props.name}
      </Text>
    </Center>
  );
};

const styles = StyleSheet.create({
  badge: { height: "100%", aspectRatio: 1 },
});

export default Splashtag;
