import { ImageSource } from "expo-image";
import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { PureIconButton } from "./IconButton";
import Image from "./Image";
import Marquee from "./Marquee";
import { Circle, Rectangle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { TextStyles, useTheme, ViewStyles } from "./Styles";
import Text from "./Text";

interface TitledListProps {
  color?: string;
  title?: string;
  children?: React.ReactNode;
}

const TitledList = (props: TitledListProps) => {
  return (
    <VStack center>
      <HStack center style={ViewStyles.mb4}>
        <Circle size={12} color={props.color} style={ViewStyles.mr2} />
        <Marquee style={[TextStyles.h2, { color: props.color }]}>{props.title}</Marquee>
      </HStack>
      <VStack center style={ViewStyles.wf}>
        {props.children}
      </VStack>
    </VStack>
  );
};

interface ResultTitledListProps extends TitledListProps {
  image: ImageSource;
  subtitle?: string;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

const ResultTitledList = (props: ResultTitledListProps) => {
  const theme = useTheme();

  const colored = useRef(new Animated.Value(0)).current;
  const cover = colored.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ViewStyles.disabled.opacity],
  });
  const buttonColor = colored.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.territoryColor, "white"],
  });
  const textColor = colored.interpolate({
    inputRange: [0, 1],
    outputRange: [props.color ?? theme.territoryColor, "white"],
  });

  const onLoad = () => {
    Animated.timing(colored, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <VStack center>
      <Image
        source={props.image}
        style={[ViewStyles.r2, styles.panel, { position: "absolute" }]}
        onLoad={onLoad}
      />
      <Rectangle
        width={styles.panel.width}
        height={styles.panel.height}
        color="black"
        style={[ViewStyles.r2, { position: "absolute", opacity: cover }]}
      />
      <HStack flex center justify style={[ViewStyles.mb2, styles.panel]}>
        <PureIconButton
          disabled={props.leftDisabled}
          size={24}
          icon="chevron-left"
          hitSlop={8}
          style={{ marginLeft: -4 }}
          onPress={props.onLeftPress}
        />
        <HStack center>
          <Circle size={12} color={textColor} style={ViewStyles.mr2} />
          <Marquee style={TextStyles.h2}>
            <Animated.Text style={{ color: textColor }}>{props.title}</Animated.Text>
          </Marquee>
        </HStack>
        <PureIconButton
          disabled={props.rightDisabled}
          size={24}
          icon="chevron-right"
          hitSlop={8}
          style={{ marginRight: -4 }}
          onPress={props.onRightPress}
        />
      </HStack>
      {props.subtitle && (
        <Center style={ViewStyles.mb2}>
          <Text center>{props.subtitle}</Text>
        </Center>
      )}
      <VStack center style={ViewStyles.wf}>
        {props.children}
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  panel: {
    ...ViewStyles.wf,
    height: 32,
  },
});

export { TitledList, ResultTitledList };
