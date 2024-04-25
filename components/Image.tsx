import { Image as EImage, ImageContentFit, ImageLoadEventData, ImageSource } from "expo-image";
import { ImageStyle, StyleProp } from "react-native";
import Placeholders from "../models/placeholders";
import { useTheme } from "./Styles";

interface ImageProps {
  source?: ImageSource;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  onLoad?: (event: ImageLoadEventData) => void;
}

const Image = (props: ImageProps) => {
  const theme = useTheme();

  return (
    <EImage
      source={props.source}
      contentFit={props.contentFit ?? "cover"}
      // HACK: forcly cast.
      style={[theme.territoryStyle, props.style as any]}
      transition={300}
      recyclingKey={props.source?.cacheKey}
      placeholder={Placeholders[props.source?.cacheKey ?? ""]}
      placeholderContentFit={props.contentFit ?? "cover"}
      onLoad={props.onLoad}
    />
  );
};

export { ImageSource } from "expo-image";
export default Image;
