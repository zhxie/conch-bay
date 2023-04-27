import { useState } from "react";
import { Dimensions, ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Center,
  ChartData,
  Color,
  ColorFilterButton,
  CompareChart,
  Display,
  HStack,
  Icon,
  Marquee,
  Modal,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { burnColor, getVsSelfPlayer } from "../utils/ui";
import { ResultProps } from "./ResultView";

interface TrendViewProps {
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

type BattleDimension =
  | "VICTORY"
  | "SPLATTED"
  | "SPLATTED_TEAM_AVERAGE"
  | "SPLATTED_INCLUDING_ASSISTED"
  | "SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE"
  | "BE_SPLATTED"
  | "BE_SPLATTED_TEAM_AVERAGE"
  | "SPECIAL_WEAPON_USES"
  | "SPECIAL_WEAPON_USES_TEAM_AVERAGE";
type CoopDimension =
  | "CLEAR"
  | "WAVES_CLEARED"
  | "HAZARD_LEVEL"
  | "BOSS_SALMONIDS_DEFEATED"
  | "BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE"
  | "GOLDEN_EGGS_COLLECTED"
  | "GOLDEN_EGGS_COLLECTED_TEAM_AVERAGE"
  | "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED"
  | "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE"
  | "POWER_EGGS_COLLECTED"
  | "POWER_EGGS_COLLECTED_TEAM_AVERAGE"
  | "RESCUED"
  | "RESCUED_TEAM_AVERAGE"
  | "BE_RESCUED"
  | "BE_RESCUED_TEAM_AVERAGE";

const TrendsView = (props: TrendViewProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  const [trends, setTrends] = useState(false);
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

  const pointCount = Math.max(Math.round(Dimensions.get("window").width / 20), 20);
  const battles = props.results?.filter((result) => result.battle).map((result) => result.battle!);
  const battleGroups = battles ? split(battles, pointCount) : [];
  const coops = props.results?.filter((result) => result.coop).map((result) => result.coop!);
  const coopGroups = coops ? split(coops, pointCount) : [];

  const formatBattleGroup = () => {
    const victory: ChartData = { data: [], color: Color.AccentColor, max: 100, relative: true },
      splatted: ChartData = { data: [], color: Color.KillAndRescue },
      splattedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.KillAndRescue),
        dash: true,
      },
      splattedIncludingAssisted: ChartData = { data: [], color: Color.KillAndRescue },
      splattedIncludingAssistedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.KillAndRescue),
        dash: true,
      },
      beSplatted: ChartData = { data: [], color: Color.Death },
      beSplattedTeamAverage: ChartData = { data: [], color: burnColor(Color.Death), dash: true },
      specialWeaponUses: ChartData = { data: [], color: Color.Special },
      specialWeaponUsesTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.Special),
        dash: true,
      };

    for (const battleGroup of battleGroups) {
      let v = 0,
        k = 0,
        kt = 0,
        a = 0,
        at = 0,
        d = 0,
        dt = 0,
        sp = 0,
        spt = 0;
      for (const battle of battleGroup) {
        if (battle.vsHistoryDetail!.judgement === "WIN") {
          v += 100;
        }
        k += getVsSelfPlayer(battle).result?.kill ?? 0;
        kt +=
          battle
            .vsHistoryDetail!.myTeam.players.map((player) => player.result?.kill ?? 0)
            .reduce((prev, current) => prev + current, 0) /
          battle.vsHistoryDetail!.myTeam.players.length;
        a += getVsSelfPlayer(battle).result?.assist ?? 0;
        at +=
          battle
            .vsHistoryDetail!.myTeam.players.map((player) => player.result?.assist ?? 0)
            .reduce((prev, current) => prev + current, 0) /
          battle.vsHistoryDetail!.myTeam.players.length;
        d += getVsSelfPlayer(battle).result?.death ?? 0;
        dt +=
          battle
            .vsHistoryDetail!.myTeam.players.map((player) => player.result?.death ?? 0)
            .reduce((prev, current) => prev + current, 0) /
          battle.vsHistoryDetail!.myTeam.players.length;
        sp += getVsSelfPlayer(battle).result?.special ?? 0;
        spt +=
          battle
            .vsHistoryDetail!.myTeam.players.map((player) => player.result?.special ?? 0)
            .reduce((prev, current) => prev + current, 0) /
          battle.vsHistoryDetail!.myTeam.players.length;
      }
      victory.data.push(v / battleGroup.length);
      splatted.data.push(k / battleGroup.length);
      splattedTeamAverage.data.push(kt / battleGroup.length);
      splattedIncludingAssisted.data.push((k + a) / battleGroup.length);
      splattedIncludingAssistedTeamAverage.data.push((kt + at) / battleGroup.length);
      beSplatted.data.push(d / battleGroup.length);
      beSplattedTeamAverage.data.push(dt / battleGroup.length);
      specialWeaponUses.data.push(sp / battleGroup.length);
      specialWeaponUsesTeamAverage.data.push(spt / battleGroup.length);
    }

    return {
      victory,
      splatted,
      splattedTeamAverage,
      splattedIncludingAssisted,
      splattedIncludingAssistedTeamAverage,
      beSplatted,
      beSplattedTeamAverage,
      specialWeaponUses,
      specialWeaponUsesTeamAverage,
    };
  };
  const formatCoopGroup = () => {
    const clear: ChartData = { data: [], color: Color.AccentColor, max: 100, relative: true },
      wavesCleared: ChartData = { data: [], color: Color.SalmonRun },
      hazardLevel: ChartData = { data: [], color: Color.BigRun },
      bossSalmonidsDefeated: ChartData = { data: [], color: Color.KillAndRescue },
      bossSalmonidsDefeatedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.KillAndRescue),
        dash: true,
      },
      goldenEggsCollected: ChartData = { data: [], color: Color.GoldenEgg },
      goldenEggsCollectedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.GoldenEgg),
        dash: true,
      },
      goldenEggsCollectedIncludingAssisted: ChartData = { data: [], color: Color.GoldenEgg },
      goldenEggsCollectedIncludingAssistedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.GoldenEgg),
        dash: true,
      },
      powerEggsCollected: ChartData = { data: [], color: Color.PowerEgg },
      powerEggsCollectedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.PowerEgg),
        dash: true,
      },
      rescued: ChartData = { data: [], color: Color.KillAndRescue },
      rescuedTeamAverage: ChartData = {
        data: [],
        color: burnColor(Color.KillAndRescue),
        dash: true,
      },
      beRescued: ChartData = { data: [], color: Color.Death },
      beRescuedTeamAverage: ChartData = { data: [], color: burnColor(Color.Death), dash: true };

    for (const coopGroup of coopGroups) {
      let c = 0,
        w = 0,
        h = 0,
        k = 0,
        kt = 0,
        g = 0,
        gt = 0,
        a = 0,
        at = 0,
        p = 0,
        pt = 0,
        r = 0,
        rt = 0,
        d = 0,
        dt = 0;
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
        kt +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.defeatEnemyCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
        g += coop.coopHistoryDetail!.myResult.goldenDeliverCount;
        gt +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.goldenDeliverCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
        a += coop.coopHistoryDetail!.myResult.goldenAssistCount;
        at +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.goldenAssistCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
        p += coop.coopHistoryDetail!.myResult.deliverCount;
        pt +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.deliverCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
        r += coop.coopHistoryDetail!.myResult.rescueCount;
        rt +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.rescueCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
        d += coop.coopHistoryDetail!.myResult.rescuedCount;
        dt +=
          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
            .map((memberResult) => memberResult.rescuedCount)
            .reduce((prev, current) => prev + current, 0) /
          (coop.coopHistoryDetail!.memberResults.length + 1);
      }
      clear.data.push(c / coopGroup.length);
      wavesCleared.data.push(w / coopGroup.length);
      hazardLevel.data.push(h / coopGroup.length);
      bossSalmonidsDefeated.data.push(k / coopGroup.length);
      bossSalmonidsDefeatedTeamAverage.data.push(kt / coopGroup.length);
      goldenEggsCollected.data.push(g / coopGroup.length);
      goldenEggsCollectedTeamAverage.data.push(gt / coopGroup.length);
      goldenEggsCollectedIncludingAssisted.data.push((g + a) / coopGroup.length);
      goldenEggsCollectedIncludingAssistedTeamAverage.data.push((gt + at) / coopGroup.length);
      powerEggsCollected.data.push(p / coopGroup.length);
      powerEggsCollectedTeamAverage.data.push(pt / coopGroup.length);
      rescued.data.push(r / coopGroup.length);
      rescuedTeamAverage.data.push(rt / coopGroup.length);
      beRescued.data.push(d / coopGroup.length);
      beRescuedTeamAverage.data.push(dt / coopGroup.length);
    }

    return {
      clear,
      wavesCleared,
      hazardLevel,
      bossSalmonidsDefeated,
      bossSalmonidsDefeatedTeamAverage,
      goldenEggsCollected,
      goldenEggsCollectedTeamAverage,
      goldenEggsCollectedIncludingAssisted,
      goldenEggsCollectedIncludingAssistedTeamAverage,
      powerEggsCollected,
      powerEggsCollectedTeamAverage,
      rescued,
      rescuedTeamAverage,
      beRescued,
      beRescuedTeamAverage,
    };
  };

  const battleData = formatBattleGroup();
  const coopData = formatCoopGroup();

  const onTrendsPress = () => {
    setTrends(true);
  };
  const onTrendsClose = () => {
    setTrends(false);
  };
  const getBattleData = (dimension: BattleDimension) => {
    switch (dimension) {
      case "VICTORY":
        return battleData.victory;
      case "SPLATTED":
        return battleData.splatted;
      case "SPLATTED_TEAM_AVERAGE":
        return battleData.splattedTeamAverage;
      case "SPLATTED_INCLUDING_ASSISTED":
        return battleData.splattedIncludingAssisted;
      case "SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return battleData.splattedIncludingAssistedTeamAverage;
      case "BE_SPLATTED":
        return battleData.beSplatted;
      case "BE_SPLATTED_TEAM_AVERAGE":
        return battleData.beSplattedTeamAverage;
      case "SPECIAL_WEAPON_USES":
        return battleData.specialWeaponUses;
      case "SPECIAL_WEAPON_USES_TEAM_AVERAGE":
        return battleData.specialWeaponUsesTeamAverage;
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
      case "BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE":
        return coopData.bossSalmonidsDefeatedTeamAverage;
      case "GOLDEN_EGGS_COLLECTED":
        return coopData.goldenEggsCollected;
      case "GOLDEN_EGGS_COLLECTED_TEAM_AVERAGE":
        return coopData.goldenEggsCollectedTeamAverage;
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED":
        return coopData.goldenEggsCollectedIncludingAssisted;
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return coopData.goldenEggsCollectedIncludingAssistedTeamAverage;
      case "POWER_EGGS_COLLECTED":
        return coopData.powerEggsCollected;
      case "POWER_EGGS_COLLECTED_TEAM_AVERAGE":
        return coopData.powerEggsCollectedTeamAverage;
      case "RESCUED":
        return coopData.rescued;
      case "RESCUED_TEAM_AVERAGE":
        return coopData.rescuedTeamAverage;
      case "BE_RESCUED":
        return coopData.beRescued;
      case "BE_RESCUED_TEAM_AVERAGE":
        return coopData.beRescuedTeamAverage;
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
      <ToolButton icon="trending-up" title={t("trends")} onPress={onTrendsPress} />
      <Modal isVisible={trends} onClose={onTrendsClose} style={ViewStyles.modal2d}>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={battleGroups.length === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battles?.length ?? 0}</Text>
          </Display>
          {battleGroups.length > 0 && (
            <VStack style={[ViewStyles.rb2, style]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack flex center>
                  <ColorFilterButton
                    color={battleDimensions.includes("VICTORY") ? Color.AccentColor : undefined}
                    title={`${t("victory")} (%)`}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("VICTORY");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      battleDimensions.includes("SPLATTED") ||
                      battleDimensions.includes("SPLATTED_TEAM_AVERAGE")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("splatted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("SPLATTED");
                    }}
                    onLongPress={() => {
                      onBattleDimensionPress("SPLATTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      battleDimensions.includes("SPLATTED_INCLUDING_ASSISTED") ||
                      battleDimensions.includes("SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("splatted_including_assisted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("SPLATTED_INCLUDING_ASSISTED");
                    }}
                    onLongPress={() => {
                      onBattleDimensionPress("SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      battleDimensions.includes("BE_SPLATTED") ||
                      battleDimensions.includes("BE_SPLATTED_TEAM_AVERAGE")
                        ? Color.Death
                        : undefined
                    }
                    title={t("be_splatted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onBattleDimensionPress("BE_SPLATTED");
                    }}
                    onLongPress={() => {
                      onBattleDimensionPress("BE_SPLATTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      battleDimensions.includes("SPECIAL_WEAPON_USES") ||
                      battleDimensions.includes("SPECIAL_WEAPON_USES_TEAM_AVERAGE")
                        ? Color.Special
                        : undefined
                    }
                    title={t("special_weapon_uses")}
                    style={{ backgroundColor: "transparent" }}
                    onPress={() => {
                      onBattleDimensionPress("SPECIAL_WEAPON_USES");
                    }}
                    onLongPress={() => {
                      onBattleDimensionPress("SPECIAL_WEAPON_USES_TEAM_AVERAGE");
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
                  <ColorFilterButton
                    color={coopDimensions.includes("CLEAR") ? Color.AccentColor : undefined}
                    title={`${t("clear")} (%)`}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("CLEAR");
                    }}
                  />
                  <ColorFilterButton
                    color={coopDimensions.includes("WAVES_CLEARED") ? Color.SalmonRun : undefined}
                    title={t("waves_cleared")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("WAVES_CLEARED");
                    }}
                  />
                  <ColorFilterButton
                    color={coopDimensions.includes("HAZARD_LEVEL") ? Color.BigRun : undefined}
                    title={t("hazard_level")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("HAZARD_LEVEL");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("BOSS_SALMONIDS_DEFEATED") ||
                      coopDimensions.includes("BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("boss_salmonids_defeated")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("BOSS_SALMONIDS_DEFEATED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("GOLDEN_EGGS_COLLECTED") ||
                      coopDimensions.includes("GOLDEN_EGGS_COLLECTED")
                        ? Color.GoldenEgg
                        : undefined
                    }
                    title={t("golden_eggs_collected")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED") ||
                      coopDimensions.includes(
                        "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE"
                      )
                        ? Color.GoldenEgg
                        : undefined
                    }
                    title={t("golden_eggs_collected_including_assisted")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("POWER_EGGS_COLLECTED") ||
                      coopDimensions.includes("POWER_EGGS_COLLECTED_TEAM_AVERAGE")
                        ? Color.PowerEgg
                        : undefined
                    }
                    title={t("power_eggs_collected")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("POWER_EGGS_COLLECTED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("POWER_EGGS_COLLECTED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("RESCUED") ||
                      coopDimensions.includes("RESCUED_TEAM_AVERAGE")
                        ? Color.KillAndRescue
                        : undefined
                    }
                    title={t("rescued")}
                    style={[ViewStyles.mr2, { backgroundColor: "transparent" }]}
                    onPress={() => {
                      onCoopDimensionPress("RESCUED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("RESCUED_TEAM_AVERAGE");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      coopDimensions.includes("BE_RESCUED") ||
                      coopDimensions.includes("BE_RESCUED_TEAM_AVERAGE")
                        ? Color.Death
                        : undefined
                    }
                    title={t("be_rescued")}
                    style={{ backgroundColor: "transparent" }}
                    onPress={() => {
                      onCoopDimensionPress("BE_RESCUED");
                    }}
                    onLongPress={() => {
                      onCoopDimensionPress("BE_RESCUED_TEAM_AVERAGE");
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
        <Text center style={(battleGroups.length > 0 || coopGroups.length > 0) && ViewStyles.mb2}>
          {t("stats_notice")}
        </Text>
        {(battleGroups.length > 0 || coopGroups.length > 0) && (
          <HStack style={ViewStyles.c}>
            <Icon name="info" size={14} color={Color.MiddleTerritory} style={ViewStyles.mr1} />
            <HStack style={ViewStyles.i}>
              <Marquee style={TextStyles.subtle}>{t("trends_notice")}</Marquee>
            </HStack>
          </HStack>
        )}
      </Modal>
    </Center>
  );
};

export default TrendsView;
