import React from "react";
import { NativeBaseProvider, extendTheme } from "native-base";

// Auto dark mode.
const config = {
  useSystemColorMode: true,
};
export const theme = extendTheme({ config });

const App = () => {
  return <NativeBaseProvider theme={theme}></NativeBaseProvider>;
};

export default App;
