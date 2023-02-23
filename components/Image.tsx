import { Image as EImage, ImageSource } from "expo-image";
import { ImageStyle, StyleProp, useColorScheme } from "react-native";
import { ViewStyles } from "./Styles";

interface ImageProps {
  source?: ImageSource;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const colorScheme = useColorScheme();
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  // HACK: forcly cast.
  return <EImage source={props.source} style={[imageStyle, props.style as any]} transition={300} />;
};

export { ImageSource } from "expo-image";
export default Image;
