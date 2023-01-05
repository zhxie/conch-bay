import { ImageStyle, StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import Image from "./Image";
import { Circle } from "./Shape";

interface AvatarProps {
  size: number;
  isDisabled?: boolean;
  uri?: string;
  cacheKey?: string;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const Avatar = (props: AvatarProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      style={[
        {
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
        },
        props.style,
      ]}
    >
      {props.uri && (
        <Image
          uri={props.uri}
          cacheKey={props.cacheKey ?? ""}
          style={[
            { width: props.size, height: props.size, borderRadius: props.size / 2 },
            props.imageStyle,
          ]}
        />
      )}
      {props.badge && (
        <Circle
          size={12}
          color={props.badge}
          style={{ position: "absolute", right: 0, bottom: 0 }}
        />
      )}
    </Pressable>
  );
};

export default Avatar;
