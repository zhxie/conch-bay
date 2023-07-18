import { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import Icon from "./Icon";
import Pressable from "./Pressable";
import { Center } from "./Stack";
import { Color } from "./Styles";

interface IconButtonProps {
  isDisabled?: boolean;
  size: number;
  color?: string;
  icon: string;
  spin?: boolean;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const IconButton = (props: IconButtonProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (props.spin) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [props.spin]);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start((result) => {
      if (result.finished) {
        startSpinning();
      } else {
        spinValue.setValue(0);
      }
    });
  };
  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  return (
    <Pressable
      isDisabled={props.isDisabled}
      hitSlop={props.hitSlop}
      style={[
        {
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
        },
        !!props.color && { backgroundColor: props.color },
        props.style,
      ]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      <Center flex>
        <Animated.View
          style={{
            width: props.size * 0.5,
            height: props.size * 0.5,
            transform: [{ rotate: spin }],
          }}
        >
          <Icon
            // HACK: forcly cast.
            name={props.icon as any}
            size={props.size * 0.5}
            color={props.color ? "white" : Color.MiddleTerritory}
            style={{ lineHeight: props.size * 0.5 }}
          />
        </Animated.View>
      </Center>
    </Pressable>
  );
};

const PureIconButton = (props: IconButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      hitSlop={props.hitSlop}
      style={[
        {
          width: props.size,
          height: props.size,
          backgroundColor: "transparent",
        },
        props.style,
      ]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      <Center flex>
        <Icon
          // HACK: forcly cast.
          name={props.icon as any}
          size={props.size}
          color={props.color ? "white" : Color.MiddleTerritory}
        />
      </Center>
    </Pressable>
  );
};

export { IconButton, PureIconButton };
