import { ImageStyle, StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import Image from "./Image";

interface AvatarProps {
  size: number;
  isDisabled?: boolean;
  uri?: string;
  cacheKey?: string;
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
    </Pressable>
  );
};

export default Avatar;
