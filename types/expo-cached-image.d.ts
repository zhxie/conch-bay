declare module "expo-cached-image" {
  import { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";

  interface CachedImagesProps {
    source?: ImageSourcePropType;
    style: StyleProp<ImageStyle>;
    cacheKey: string;
    placeholderContent?: React.ReactNode;
  }

  class CachedImages extends React.Component<CachedImagesProps> {}
  export default CachedImages;

  class CacheManager {
    static async downloadAsync({ uri: string, key: string }): Promise<void>;
  }
  export { CacheManager };
}
