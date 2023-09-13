import React, { createContext, useContext } from "react";
import { StyleProp, ViewStyle } from "react-native";

const SalmonRunSwitcherContext = createContext({ salmonRun: false });

interface SalmonRunSwitcherProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const SalmonRunSwitcher = (props: SalmonRunSwitcherProps) => {
  const context = useContext(SalmonRunSwitcherContext);

  const children = React.Children.toArray(props.children);

  if (context.salmonRun) {
    return (
      <>
        {children[1]}
        {children[0]}
      </>
    );
  }
  return (
    <>
      {children[0]}
      {children[1]}
    </>
  );
};

export { SalmonRunSwitcherContext };
export default SalmonRunSwitcher;
