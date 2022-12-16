import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  useColorScheme,
  ViewStyle,
} from "react-native";
import Pressable from "./Pressable";
import { ViewStyles } from "./Styles";

interface AvatarProps {
  size: number;
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

const Avatar = (props: AvatarProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <Pressable
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
            style,
            props.imageStyle,
          ]}
          alt=""
        />
      )}
    </Pressable>
  );
};

export default Avatar;
