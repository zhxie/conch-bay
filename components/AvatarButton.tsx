import { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { BadgeProps } from "./Avatar";
import Image, { ImageSource } from "./Image";
import Pressable from "./Pressable";
import { Circle } from "./Shape";

interface AvatarButtonProps {
  size: number;
  isDisabled?: boolean;
  image?: ImageSource;
  recyclingKey?: string;
  badge?: BadgeProps;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

const AvatarButton = (props: AvatarButtonProps) => {
  const circle = { width: props.size, height: props.size, borderRadius: props.size / 2 };

  return (
    <Pressable isDisabled={props.isDisabled} onPress={props.onPress} style={[circle, props.style]}>
      {props.image && (
        <Image
          source={props.image}
          recyclingKey={props.recyclingKey}
          style={[circle, props.imageStyle]}
        />
      )}
      {props.badge && (
        <Circle
          size={12}
          color={props.badge.color}
          outline={props.badge.outline}
          style={{ position: "absolute", right: 0, bottom: 0 }}
        />
      )}
    </Pressable>
  );
};

export default AvatarButton;
