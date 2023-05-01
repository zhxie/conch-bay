import { StyleSheet, useColorScheme } from "react-native";

export enum Color {
  // UI.
  AccentColor = "#6b84f5",
  LightBackground = "#fafafa",
  DarkBackground = "#18181b",
  LightText = "black",
  DarkText = "white",
  LightTerritory = "#f4f4f5",
  MiddleTerritory = "#a1a1aa",
  DarkTerritory = "#3f3f46",
  KillAndRescue = "#22c55e",
  Death = "#ef4444",
  Special = "#eab308",
  UltraSignal = "#06b6d4",
  // Splatoon (UI-adjusted).
  RegularBattle = "#22c55e",
  AnarchyBattle = "#ea580c",
  XBattle = "#34d399",
  PrivateBattle = "#c026d3",
  SalmonRun = "#f97316",
  BigRun = "#9333ea",
  EggstraWork = "#facc15",
  TableturfBattle = "#6d28d9",
  // Splatoon.
  Playing = "#f02d7d",
  Online = "#6af6cd",
  PowerEgg = "#ff6200",
  GoldenEgg = "#ffce00",
  GoldScale = "#e4b23e",
  SilverScale = "#9c9c9c",
  BronzeScale = "#c6702f",
}

export const TextStyles = StyleSheet.create({
  light: {
    color: Color.LightText,
  },
  dark: {
    color: Color.DarkText,
  },
  subtle: {
    color: Color.MiddleTerritory,
  },
  p: {
    fontSize: 14,
    fontWeight: "normal",
  },
  b: {
    fontWeight: "bold",
  },
  i: {
    fontStyle: "italic",
  },
  link: {
    textDecorationLine: "underline",
  },
  h1: {
    fontSize: 18,
    fontWeight: "bold",
  },
  h2: {
    fontSize: 16,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 16,
    fontWeight: "normal",
  },
  h5: {
    fontSize: 12,
    fontWeight: "bold",
  },
  h6: {
    fontSize: 12,
    fontWeight: "normal",
  },
  h7: {
    fontSize: 10,
    fontWeight: "bold",
  },
  c: {
    textAlign: "center",
  },
});

export const ViewStyles = StyleSheet.create({
  transparent: {
    backgroundColor: "transparent",
  },
  light: {
    backgroundColor: Color.LightBackground,
  },
  dark: {
    backgroundColor: Color.DarkBackground,
  },
  lightTerritory: {
    backgroundColor: Color.LightTerritory,
  },
  darkTerritory: {
    backgroundColor: Color.DarkTerritory,
  },
  accent: {
    backgroundColor: Color.AccentColor,
  },
  danger: {
    backgroundColor: Color.Death,
  },
  disabled: {
    opacity: 0.4,
  },
  modal0_67d: {
    maxHeight: 384,
    width: "90%",
    maxWidth: 576,
    position: "absolute",
    bottom: 0,
  },
  modal1d: {
    maxHeight: 576,
    width: "90%",
    maxWidth: 576,
    position: "absolute",
    bottom: 0,
  },
  modal1f: {
    height: 576,
    width: "90%",
    maxWidth: 576,
    position: "absolute",
    bottom: 0,
  },
  modal2d: {
    maxHeight: 576,
    width: "100%",
    maxWidth: 648,
    position: "absolute",
    bottom: 0,
  },
  modal2f: {
    height: 576,
    width: "100%",
    maxWidth: 648,
    position: "absolute",
    bottom: 0,
  },
  modal3d: {
    maxHeight: 620,
    width: "100%",
    maxWidth: 648,
    position: "absolute",
    bottom: 0,
  },
  wf: {
    width: "100%",
  },
  f: {
    flex: 1,
  },
  i: {
    flexGrow: 0,
    flexShrink: 1,
  },
  h: {
    flexDirection: "row",
  },
  v: {
    flexDirection: "column",
  },
  c: {
    alignItems: "center",
    justifyContent: "center",
  },
  j: {
    justifyContent: "space-between",
  },
  r0_5: {
    borderRadius: 2,
  },
  r1: {
    borderRadius: 4,
  },
  r2: {
    borderRadius: 8,
  },
  rt0: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  rt2: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  rb0: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  rb2: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  s1: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  s2: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sept: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${Color.MiddleTerritory}3f`,
  },
  sepb: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${Color.MiddleTerritory}3f`,
  },
  sepl: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: `${Color.MiddleTerritory}3f`,
  },
  sepr: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: `${Color.MiddleTerritory}3f`,
  },
  // TODO: prefer applying margins to lefts and tops.
  mr0_5: {
    marginRight: 2,
  },
  mr1: {
    marginRight: 4,
  },
  mr2: {
    marginRight: 8,
  },
  mr3: {
    marginRight: 12,
  },
  mr4: {
    marginRight: 16,
  },
  mb0_5: {
    marginBottom: 2,
  },
  mb1: {
    marginBottom: 4,
  },
  mb2: {
    marginBottom: 8,
  },
  mb3: {
    marginBottom: 12,
  },
  mb4: {
    marginBottom: 16,
  },
  p1: {
    padding: 4,
  },
  p2: {
    padding: 8,
  },
  p3: {
    padding: 12,
  },
  p4: {
    padding: 16,
  },
  px0_25: {
    paddingHorizontal: 1,
  },
  px0_5: {
    paddingHorizontal: 2,
  },
  px1: {
    paddingHorizontal: 4,
  },
  px2: {
    paddingHorizontal: 8,
  },
  px3: {
    paddingHorizontal: 12,
  },
  px4: {
    paddingHorizontal: 16,
  },
  pl1: {
    paddingLeft: 4,
  },
  pl2: {
    paddingLeft: 8,
  },
  pl3: {
    paddingLeft: 12,
  },
  pl4: {
    paddingLeft: 16,
  },
  pr1: {
    paddingRight: 4,
  },
  pr2: {
    paddingRight: 8,
  },
  pr3: {
    paddingRight: 12,
  },
  pr4: {
    paddingRight: 16,
  },
  py0_25: {
    paddingVertical: 1,
  },
  py0_5: {
    paddingVertical: 2,
  },
  py1: {
    paddingVertical: 4,
  },
  py2: {
    paddingVertical: 8,
  },
  py3: {
    paddingVertical: 12,
  },
  py4: {
    paddingVertical: 16,
  },
});

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const textColor = colorScheme === "light" ? Color.LightText : Color.DarkText;
  const backgroundColor = colorScheme === "light" ? Color.LightBackground : Color.DarkBackground;
  const territoryColor = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;
  const reverseTextStyle = colorScheme === "light" ? TextStyles.dark : TextStyles.light;
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;
  const territoryStyle =
    colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  return {
    colorScheme,
    textColor,
    backgroundColor,
    territoryColor,
    textStyle,
    reverseTextStyle,
    backgroundStyle,
    territoryStyle,
  };
};
