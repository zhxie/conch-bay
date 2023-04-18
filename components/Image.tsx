import { Image as EImage, ImageSource } from "expo-image";
import { ImageStyle, StyleProp, useColorScheme } from "react-native";
import { ViewStyles } from "./Styles";

interface ImageProps {
  source?: ImageSource;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const colorScheme = useColorScheme();
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return (
    <EImage
      source={props.source}
      // HACK: forcly cast.
      style={[imageStyle, props.style as any]}
      transition={300}
      recyclingKey={props.recyclingKey}
    />
  );
};

export { ImageSource } from "expo-image";
export default Image;
