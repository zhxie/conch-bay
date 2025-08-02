import createIconSet from "@expo/vector-icons/createIconSet";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, TextStyle, ViewStyle } from "react-native";
import { Lucide } from "../assets/fonts/Lucide";
import glyphMap from "../assets/fonts/Lucide.json";

// HACK: the 3rd argument expoAssetId actually is not used.
const LucideIcon = createIconSet(glyphMap, "Lucide", "Lucide");

interface IconProps {
  name: Lucide;
  size: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const Icon = (props: IconProps) => {
  return (
    <LucideIcon
      name={props.name}
      size={props.size}
      color={props.color}
      style={[{ lineHeight: props.size }, props.style]}
    />
  );
};

interface AnimatedIconProps {
  name: Lucide;
  size: number;
  color?: string;
  spin?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedIcon = (props: AnimatedIconProps) => {
  const { spin, style, ...rest } = props;

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (spin) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [spin]);

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
    <Animated.View
      style={[
        {
          width: props.size,
          height: props.size,
          transform: [{ rotate: spinInterpolation }],
        },
        style,
      ]}
    >
      <Icon {...rest} />
    </Animated.View>
  );
};

export { Lucide as IconName, AnimatedIcon };
export default Icon;
