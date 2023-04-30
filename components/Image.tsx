import { Image as EImage, ImageSource } from "expo-image";
import { ImageStyle, StyleProp } from "react-native";
import { useTheme } from "./Styles";

interface ImageProps {
  source?: ImageSource;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const theme = useTheme();

  return (
    <EImage
      source={props.source}
      // HACK: forcly cast.
      style={[theme.territoryStyle, props.style as any]}
      transition={300}
      recyclingKey={props.recyclingKey}
    />
  );
};

export { ImageSource } from "expo-image";
export default Image;
