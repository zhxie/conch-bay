import { StyleSheet } from "react-native";

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
  // Splatoon.
  RegularBattle = "#22c55e",
  AnarchyBattle = "#ea580c",
  XBattle = "#34d399",
  PrivateBattle = "#c026d3",
  Shiver = "#0034ff",
  Frye = "#ffff00",
  BigMan = "#999999",
  SalmonRun = "#f97316",
  BigRun = "#9333ea",
  Online = "#6af6cd",
  Playing = "#f02d7d",
  Working = "#f02d7d",
  PowerEgg = "#ff6200",
  GoldenEgg = "#ffce00",
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
  },
  b: {
    fontSize: 14,
    fontWeight: "bold",
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
  },
  h5: {
    fontSize: 12,
    fontWeight: "bold",
  },
  h6: {
    fontSize: 12,
  },
  c: {
    textAlign: "center",
  },
});

export const ViewStyles = StyleSheet.create({
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
  disabled: {
    opacity: 0.4,
  },
  modal1dc: {
    maxHeight: 576,
    width: "90%",
    position: "absolute",
  },
  modal1d: {
    maxHeight: 576,
    width: "90%",
    position: "absolute",
    bottom: 0,
  },
  modal1f: {
    height: 576,
    width: "90%",
    position: "absolute",
    bottom: 0,
  },
  modal2d: {
    maxHeight: 576,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  modal2f: {
    height: 576,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  modal3d: {
    maxHeight: 620,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  wf: {
    width: "100%",
  },
  f: {
    flex: 1,
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
  r: {
    borderRadius: 8,
  },
  rt: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  rb: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  rl: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rr: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
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
