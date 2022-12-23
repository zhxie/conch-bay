import { ImageStyle, StyleProp, useColorScheme } from "react-native";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { ViewStyles } from "./Styles";

interface ImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const colorScheme = useColorScheme();
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return <CacheImage uri={props.uri} style={[imageStyle, { overflow: "hidden" }, props.style]} />;
};

export default Image;
