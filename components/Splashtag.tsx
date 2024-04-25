import { createContext, useContext, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Image, { ImageSource } from "./Image";
import { Center, HStack } from "./Stack";
import { TextStyles, useTheme, ViewStyles } from "./Styles";

const SplashtagContext = createContext({ splatfont: false });

interface SplashtagProps {
  color: string;
  name: string;
  nameId: string;
  title: string;
  banner: ImageSource;
  badges: (ImageSource | null)[];
  style?: StyleProp<ViewStyle>;
}

const Splashtag = (props: SplashtagProps) => {
  const context = useContext(SplashtagContext);

  const theme = useTheme();

  const [width, setWidth] = useState(Dimensions.get("window").width);

  const colored = useRef(new Animated.Value(0)).current;
  const color = colored.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.textColor, props.color],
  });

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };
  const onLoad = () => {
    Animated.timing(colored, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Center flex style={props.style} onLayout={onLayout}>
      <Image
        source={props.banner}
        style={[ViewStyles.r2, { width: "100%", aspectRatio: 700 / 200 }]}
        onLoad={onLoad}
      />
      <HStack
        center
        style={{
          height: "34.5%",
          position: "absolute",
          right: (1 / 284) * width,
          bottom: (1 / 284) * width,
        }}
      >
        {props.badges.map((badge, i, badges) => {
          if (badge) {
            return (
              <Image
                key={i}
                source={badge}
                style={[
                  i === badges.length - 1 ? undefined : { marginRight: (2 / 284) * width },
                  styles.badge,
                  { backgroundColor: "transparent" },
                ]}
              />
            );
          } else {
            return (
              <View
                key={i}
                style={[
                  i === badges.length - 1 ? undefined : { marginRight: (2 / 284) * width },
                  styles.badge,
                ]}
              />
            );
          }
        })}
      </HStack>
      <Animated.Text
        numberOfLines={1}
        // TODO: use Splatfont 2. In certain locales, Splatfont 2 is replaced with other fonts.
        style={[
          TextStyles.b,
          {
            fontSize: (12 / 284) * width,
            position: "absolute",
            left: (10 / 284) * width,
            top: (5 / 284) * width,
            color: color,
            transform: [{ skewX: "-5deg" }],
          },
          // HACK: skew transform does not work on Android, using italic font style instead. Track
          // the issue in facebook/react-native#27649.
          Platform.OS === "android" && {
            fontStyle: "italic",
          },
          Platform.OS === "android" && ViewStyles.wf,
        ]}
      >
        {props.title}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        // TODO: use Splatfont 2. In certain locales, Splatfont 2 is replaced with other fonts.
        style={[
          TextStyles.b,
          {
            fontSize: (10 / 284) * width,
            position: "absolute",
            left: (10 / 284) * width,
            bottom: (5 / 284) * width,
            color: color,
          },
        ]}
      >
        {props.nameId ? `#${props.nameId}` : ""}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        style={[
          {
            position: "absolute",
            color: color,
            fontFamily: context.splatfont ? "Splatfont" : "MPLUSRounded1cExtraBold",
            fontSize: (26 / 284) * width,
          },
          Platform.OS === "android" && { height: "100%", textAlignVertical: "center" },
        ]}
      >
        {props.name}
      </Animated.Text>
    </Center>
  );
};

const styles = StyleSheet.create({
  badge: { height: "100%", aspectRatio: 1 },
});

export { SplashtagContext };
export default Splashtag;
