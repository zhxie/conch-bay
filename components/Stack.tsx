import { StyleSheet, View, ViewProps } from "react-native";
import { ViewStyles } from "./Styles";

interface CenterProps extends ViewProps {
  flex?: boolean;
}

const Center = (props: CenterProps) => {
  const { flex, style, ...rest } = props;

  return <View style={[flex && ViewStyles.f, ViewStyles.c, style]} {...rest} />;
};

interface StackProps extends CenterProps {
  center?: boolean;
  justify?: boolean;
}

const HStack = (props: StackProps) => {
  const { flex, center, justify, style, ...rest } = props;

  return (
    <View
      style={[
        flex && ViewStyles.f,
        ViewStyles.h,
        center && styles.center,
        justify && ViewStyles.j,
        style,
      ]}
      {...rest}
    />
  );
};

const VStack = (props: StackProps) => {
  const { flex, center, justify, style, ...rest } = props;

  return (
    <View
      style={[
        flex && ViewStyles.f,
        ViewStyles.v,
        center && styles.center,
        justify && ViewStyles.j,
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
  },
});

export { Center, HStack, VStack };
