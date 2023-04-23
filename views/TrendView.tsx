import { useState } from "react";
import { Dimensions, ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Center,
  ChartData,
  Color,
  CompareChart,
  Display,
  FilterButton,
  HStack,
  Modal,
  Text,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { getVsSelfPlayer } from "../utils/ui";
import { ResultProps } from "./ResultView";

interface TrendViewProps {
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

type BattleDimension =
  | "VICTORY"
  | "SPLATTED"
  | "SPLATTED_INCLUDING_ASSISTED"
  | "BE_SPLATTED"
  | "SPECIAL_WEAPON_USES";
type CoopDimension =
  | "CLEAR"
  | "WAVES_CLEARED"
  | "HAZARD_LEVEL"
  | "BOSS_SALMONIDS_DEFEATED"
  | "GOLDEN_EGGS_COLLECTED"
  | "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED"
  | "POWER_EGGS_COLLECTED"
  | "RESCUED"
  | "BE_RESCUED";

const TrendView = (props: TrendViewProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  const [trend, setTrend] = useState(false);
  const [battleDimensions, setBattleDimensions] = useState<BattleDimension[]>(["VICTORY"]);
  const [coopDimensions, setCoopDimensions] = useState<CoopDimension[]>(["CLEAR"]);

  const split = <T,>(arr: T[], count: number) => {
    const result: T[][] = [];
    const size = Math.max(Math.ceil(arr.length / count), 1);
    let start = arr.length - size;
    while (start >= 0) {
      const part: T[] = [];
      for (let i = start; i < start + size && i < arr.length; i++) {
        part.push(arr[i]);
      }
      result.push(part.reverse());
      start -= size;
    }
    return result;
  };

  const pointCount = Math.round(Dimensions.get("screen").width / 20);
  const battles = props.results?.filter((result) => result.battle).map((result) => result.battle!);
  const battleGroups = battles ? split(battles, pointCount) : [];
  const coops = props.results?.filter((result) => result.coop).map((result) => result.coop!);
  const coopGroups = coops ? split(coops, pointCount) : [];

  const formatBattleGroup = () => {
    const victory: ChartData = { data: [], color: Color.AccentColor, max: 100, relative: true },
      splatted: ChartData = { data: [], color: Color.KillAndRescue },
      splattedIncludingAssisted: ChartData = { data: [], color: Color.KillAndRescue },
      beSplatted: ChartData = { data: [], color: Color.Death },
      specialWeaponUses: ChartData = { data: [], color: Color.Special };

    for (const battleGroup of battleGroups) {
      let v = 0,
        k = 0,
        a = 0,
        d = 0,
        sp = 0;
      for (const battle of battleGroup) {
        if (battle.vsHistoryDetail!.judgement === "WIN") {
          v += 100;
        }
        k += getVsSelfPlayer(battle).result?.kill ?? 0;
        a += getVsSelfPlayer(battle).result?.assist ?? 0;
        d += getVsSelfPlayer(battle).result?.death ?? 0;
        sp += getVsSelfPlayer(battle).result?.special ?? 0;
      }
      victory.data.push(v / battleGroup.length);
      splatted.data.push(k / battleGroup.length);
      splattedIncludingAssisted.data.push((k + a) / battleGroup.length);
      beSplatted.data.push(d / battleGroup.length);
      specialWeaponUses.data.push(sp / battleGroup.length);
    }

    return {
      victory,
      splatted,
      splattedIncludingAssisted,
      beSplatted,
      specialWeaponUses,
    };
  };
  const formatCoopGroup = () => {
    const clear: ChartData = { data: [], color: Color.AccentColor, max: 100, relative: true },
      wavesCleared: ChartData = { data: [], color: Color.SalmonRun },
      hazardLevel: ChartData = { data: [], color: Color.BigRun },
      bossSalmonidsDefeated: ChartData = { data: [], color: Color.KillAndRescue },
      goldenEggsCollected: ChartData = { data: [], color: Color.GoldenEgg },
      goldenEggsCollectedIncludingAssisted: ChartData = { data: [], color: Color.GoldenEgg },
      powerEggsCollected: ChartData = { data: [], color: Color.PowerEgg },
      rescued: ChartData = { data: [], color: Color.KillAndRescue },
      beRescued: ChartData = { data: [], color: Color.Death };

    for (const coopGroup of coopGroups) {
      let c = 0,
        w = 0,
        h = 0,
        k = 0,
        g = 0,
        a = 0,
        p = 0,
        r = 0,
        d = 0;
      for (const coop of coopGroup) {
        if (coop.coopHistoryDetail!.resultWave === 0) {
          c += 100;
        }
        if (coop.coopHistoryDetail!.resultWave >= 0) {
          if (coop.coopHistoryDetail!.resultWave === 0) {
            w += coop.coopHistoryDetail!.waveResults.length;
          } else {
            w += coop.coopHistoryDetail!.resultWave - 1;
          }
        }
        h += coop.coopHistoryDetail!.dangerRate * 100;
        k += coop.coopHistoryDetail!.myResult.defeatEnemyCount;
        g += coop.coopHistoryDetail!.myResult.goldenDeliverCount;
        a += coop.coopHistoryDetail!.myResult.goldenAssistCount;
        p += coop.coopHistoryDetail!.myResult.deliverCount;
        r += coop.coopHistoryDetail!.myResult.rescueCount;
        d += coop.coopHistoryDetail!.myResult.rescuedCount;
      }
      clear.data.push(c / coopGroup.length);
      wavesCleared.data.push(w / coopGroup.length);
      hazardLevel.data.push(h / coopGroup.length);
      bossSalmonidsDefeated.data.push(k / coopGroup.length);
      goldenEggsCollected.data.push(g / coopGroup.length);
      goldenEggsCollectedIncludingAssisted.data.push((g + a) / coopGroup.length);
      powerEggsCollected.data.push(p / coopGroup.length);
      rescued.data.push(r / coopGroup.length);
      beRescued.data.push(d / coopGroup.length);
    }

    return {
      clear,
      wavesCleared,
      hazardLevel,
      bossSalmonidsDefeated,
      goldenEggsCollected,
      goldenEggsCollectedIncludingAssisted,
      powerEggsCollected,
      rescued,
      beRescued,
    };
  };

  const battleData = formatBattleGroup();
  const coopData = formatCoopGroup();

  const onTrendPress = () => {
    setTrend(true);
  };
  const onTrendClose = () => {
    setTrend(false);
  };
  const getBattleData = (dimension: BattleDimension) => {
    switch (dimension) {
      case "VICTORY":
        return battleData.victory;
      case "SPLATTED":
        return battleData.splatted;
      case "SPLATTED_INCLUDING_ASSISTED":
        return battleData.splattedIncludingAssisted;
      case "BE_SPLATTED":
        return battleData.beSplatted;
      case "SPECIAL_WEAPON_USES":
        return battleData.specialWeaponUses;
    }
  };
  const getCoopData = (dimension: CoopDimension) => {
    switch (dimension) {
      case "CLEAR":
        return coopData.clear;
      case "WAVES_CLEARED":
        return coopData.wavesCleared;
      case "HAZARD_LEVEL":
        return coopData.hazardLevel;
      case "BOSS_SALMONIDS_DEFEATED":
        return coopData.bossSalmonidsDefeated;
      case "GOLDEN_EGGS_COLLECTED":
        return coopData.goldenEggsCollected;
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED":
        return coopData.goldenEggsCollectedIncludingAssisted;
      case "POWER_EGGS_COLLECTED":
        return coopData.powerEggsCollected;
      case "RESCUED":
        return coopData.rescued;
      case "BE_RESCUED":
        return coopData.beRescued;
    }
  };
  const onBattleDimensionPress = (dimension: BattleDimension) => {
    const newBattleDimensions = battleDimensions.map((dimension) => dimension);
    if (newBattleDimensions.includes(dimension)) {
      const i = newBattleDimensions.indexOf(dimension);
      newBattleDimensions.splice(i, 1);
    } else {
      newBattleDimensions.push(dimension);
    }
    setBattleDimensions(newBattleDimensions);
  };
  const onCoopDimensionPress = (dimension: CoopDimension) => {
    const newCoopDimensions = coopDimensions.map((dimension) => dimension);
    if (newCoopDimensions.includes(dimension)) {
      const i = newCoopDimensions.indexOf(dimension);
      newCoopDimensions.splice(i, 1);
    } else {
      newCoopDimensions.push(dimension);
    }
    setCoopDimensions(newCoopDimensions);
  };

  return (
    <Center style={props.style}>
      <ToolButton icon="trending-up" title={t("trend")} onPress={onTrendPress} />
      <Modal isVisible={trend} onClose={onTrendClose} style={ViewStyles.modal2d}>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={battleGroups.length === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battles?.length ?? 0}</Text>
          </Display>
          {battleGroups.length > 0 && (
            <VStack style={[ViewStyles.rb2, style]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack flex center>
                  <FilterButton
                    color={battleDimensions.includes("VICTORY") ? Color.AccentColor : undefined}
                    title={`${t("victory")} (%)`}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("VICTORY");
                    }}
                  />
                  <FilterButton
                    color={battleDimensions.includes("SPLATTED") ? Color.KillAndRescue : undefined}
                    title={t("splatted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("SPLATTED");
                    }}
                  />
                  <FilterButton
                    color={
                      battleDimensions.includes("SPLATTED_INCLUDING_ASSISTED")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("splatted_including_assisted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("SPLATTED_INCLUDING_ASSISTED");
                    }}
                  />
                  <FilterButton
                    color={battleDimensions.includes("BE_SPLATTED") ? Color.Death : undefined}
                    title={t("be_splatted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("BE_SPLATTED");
                    }}
                  />
                  <FilterButton
                    color={
                      battleDimensions.includes("SPECIAL_WEAPON_USES") ? Color.Special : undefined
                    }
                    title={t("special_weapon_uses")}
                    style={{ backgroundColor: "transparent" }}
                    onPress={() => {
                      onBattleDimensionPress("SPECIAL_WEAPON_USES");
                    }}
                  />
                </HStack>
              </ScrollView>
              {battleDimensions.length > 0 && (
                <CompareChart
                  dataGroup={battleDimensions.map((dimension) => getBattleData(dimension))}
                  style={[ViewStyles.rb2, style, { height: 150, width: "100%" }]}
                />
              )}
            </VStack>
          )}
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={coopGroups.length === 0} title={t("salmon_run")}>
            <Text numberOfLines={1}>{coops?.length ?? 0}</Text>
          </Display>
          {coopGroups.length > 0 && (
            <VStack style={[ViewStyles.rb2, style]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack flex center>
                  <FilterButton
                    color={coopDimensions.includes("CLEAR") ? Color.AccentColor : undefined}
                    title={`${t("clear")} (%)`}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("CLEAR");
                    }}
                  />
                  <FilterButton
                    color={coopDimensions.includes("WAVES_CLEARED") ? Color.SalmonRun : undefined}
                    title={t("waves_cleared")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("WAVES_CLEARED");
                    }}
                  />
                  <FilterButton
                    color={coopDimensions.includes("HAZARD_LEVEL") ? Color.BigRun : undefined}
                    title={t("hazard_level")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("HAZARD_LEVEL");
                    }}
                  />
                  <FilterButton
                    color={
                      coopDimensions.includes("BOSS_SALMONIDS_DEFEATED")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("boss_salmonids_defeated")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("BOSS_SALMONIDS_DEFEATED");
                    }}
                  />
                  <FilterButton
                    color={
                      coopDimensions.includes("GOLDEN_EGGS_COLLECTED") ? Color.GoldenEgg : undefined
                    }
                    title={t("golden_eggs_collected")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED");
                    }}
                  />
                  <FilterButton
                    color={
                      coopDimensions.includes("GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED")
                        ? Color.GoldenEgg
                        : undefined
                    }
                    title={t("golden_eggs_collected_including_assisted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED");
                    }}
                  />
                  <FilterButton
                    color={
                      coopDimensions.includes("POWER_EGGS_COLLECTED") ? Color.PowerEgg : undefined
                    }
                    title={t("power_eggs_collected")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("POWER_EGGS_COLLECTED");
                    }}
                  />
                  <FilterButton
                    color={coopDimensions.includes("RESCUED") ? Color.KillAndRescue : undefined}
                    title={t("rescued")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("RESCUED");
                    }}
                  />
                  <FilterButton
                    color={coopDimensions.includes("BE_RESCUED") ? Color.Death : undefined}
                    title={t("be_rescued")}
                    style={{ backgroundColor: "transparent" }}
                    onPress={() => {
                      onCoopDimensionPress("BE_RESCUED");
                    }}
                  />
                </HStack>
              </ScrollView>
              {coopDimensions.length > 0 && (
                <CompareChart
                  dataGroup={coopDimensions.map((dimension) => getCoopData(dimension))}
                  style={[ViewStyles.rb2, style, { height: 150, width: "100%" }]}
                />
              )}
            </VStack>
          )}
        </VStack>
        <Text center>{t("stats_notice")}</Text>
      </Modal>
    </Center>
  );
};

export default TrendView;
