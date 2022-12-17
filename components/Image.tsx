import { Image as RNImage, useColorScheme, ImageProps } from "react-native";
import { ViewStyles } from "./Styles";

const Image = (props: ImageProps) => {
  const { style, ...rest } = props;

  const colorScheme = useColorScheme();
  const imageStyle = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return <RNImage style={[imageStyle, props.style]} {...rest} />;
};

export default Image;
