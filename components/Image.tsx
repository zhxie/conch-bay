import CachedImage from "expo-cached-image";
import { ImageStyle, StyleProp, useColorScheme } from "react-native";
import { Center } from "./Stack";
import { ViewStyles } from "./Styles";

interface ImageProps {
  uri: string;
  cacheKey: string;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const colorScheme = useColorScheme();
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <CachedImage
      source={{ uri: props.uri }}
      cacheKey={props.cacheKey}
      placeholderContent={<Center style={[imageStyle, { overflow: "hidden" }, props.style]} />}
      style={[imageStyle, { overflow: "hidden" }, props.style]}
    />
  );
};

export default Image;
