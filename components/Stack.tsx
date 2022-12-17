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
  reverse?: boolean;
}

const HStack = (props: StackProps) => {
  const { flex, center, reverse, style, ...rest } = props;

  return (
    <View
      style={[
        flex && ViewStyles.f,
        reverse ? ViewStyles.hr : ViewStyles.h,
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
};

const VStack = (props: StackProps) => {
  const { flex, center, reverse, style, ...rest } = props;

  return (
    <View
      style={[
        flex && ViewStyles.f,
        reverse ? ViewStyles.vr : ViewStyles.v,
        center && styles.center,
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
