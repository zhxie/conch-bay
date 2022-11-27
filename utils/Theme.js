import { extendTheme } from "native-base";
import Color from "./color";

const config = {
  useSystemColorMode: true,
};
const theme = extendTheme({ config: config, colors: Color });

export default theme;
