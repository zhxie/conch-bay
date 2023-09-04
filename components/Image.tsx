import { Image as EImage, ImageContentFit } from "expo-image";
import { createContext, useContext, useMemo } from "react";
import { ImageStyle, StyleProp } from "react-native";
import { useTheme } from "./Styles";

interface ImageSignature {
  expire: number;
  signature: string;
  key: string;
}

const ImageContext = createContext<{ images: Map<string, ImageSignature> | undefined }>({
  images: undefined,
});

interface ImageSource {
  uri?: string;
  cacheKey?: string;
}

interface ImageProps {
  source?: ImageSource;
  contentFit?: ImageContentFit;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
}

const Image = (props: ImageProps) => {
  const context = useContext(ImageContext);

  const theme = useTheme();

  const source = useMemo(() => {
    if (!props.source) {
      return props.source;
    }
    let uri = props.source.uri;
    if (uri) {
      const signature = context.images?.get(uri);
      if (signature) {
        uri = `${uri}?Expires=${signature.expire}&Signature=${signature.signature}&Key-Pair-Id=${signature.key}`;
      }
    }
    return {
      uri,
      cacheKey: props.source.cacheKey,
    };
  }, [props.source, context.images]);

  return (
    <EImage
      source={source}
      contentFit={props.contentFit}
      // HACK: forcly cast.
      style={[theme.territoryStyle, props.style as any]}
      transition={300}
      recyclingKey={props.recyclingKey}
    />
  );
};

export { ImageSignature, ImageContext, ImageSource };
export default Image;
