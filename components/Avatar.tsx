import { ImageSourcePropType, ImageStyle, StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import Image from "./Image";

interface AvatarProps {
  size: number;
  isDisabled?: boolean;
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

const Avatar = (props: AvatarProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      onPress={props.onPress}
      style={[
        {
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
        },
        props.style,
      ]}
    >
      {props.source && (
        <Image
          source={props.source}
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
