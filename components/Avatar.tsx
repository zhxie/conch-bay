import { ImageStyle, StyleProp, ViewStyle, useColorScheme } from "react-native";
import Image, { ImageSource } from "./Image";
import { Circle } from "./Shape";
import { Center } from "./Stack";
import { ViewStyles } from "./Styles";

interface BadgeProps {
  color?: string;
  outline?: string;
}
interface AvatarProps {
  size: number;
  image?: ImageSource;
  badge?: BadgeProps;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const Avatar = (props: AvatarProps) => {
  const circle = { width: props.size, height: props.size, borderRadius: props.size / 2 };

  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <Center style={[circle, style, props.style]}>
      {props.image && <Image source={props.image} style={[circle, props.imageStyle]} />}
      {props.badge && (
        <Circle
          size={12}
          color={props.badge.color}
          outline={props.badge.outline}
          style={{ position: "absolute", right: 0, bottom: 0 }}
        />
      )}
    </Center>
  );
};

export default Avatar;
