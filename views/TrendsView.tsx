import { useState } from "react";
import { Dimensions, ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Center,
  Chart,
  Color,
  ColorFilterButton,
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
import { burnColor, countBattles, countCoops } from "../utils/ui";
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

  const battleStats = battleGroups.map((group) => countBattles(group));
  const coopStats = coopGroups.map((group) => countCoops(group));

  const onTrendsPress = () => {
    setTrends(true);
  };
  const onTrendsClose = () => {
    setTrends(false);
  };
  const getBattleData = (dimension: BattleDimension) => {
    switch (dimension) {
      case "VICTORY":
        return {
          data: battleStats.map((stat) => (stat.win * 100) / stat.count),
          color: Color.AccentColor,
          max: 100,
          relative: true,
        };
      case "SPLATTED":
        return {
          data: battleStats.map((stat) => stat.kill / stat.count),
          color: Color.KillAndRescue,
        };
      case "SPLATTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) => stat.killTeam / stat.member),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "SPLATTED_INCLUDING_ASSISTED":
        return {
          data: battleStats.map((stat) => (stat.kill + stat.assist) / stat.count),
          color: Color.KillAndRescue,
        };
      case "SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) => (stat.killTeam + stat.assistTeam) / stat.member),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "BE_SPLATTED":
        return {
          data: battleStats.map((stat) => stat.death / stat.count),
          color: Color.Death,
        };
      case "BE_SPLATTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) => stat.deathTeam / stat.member),
          color: burnColor(Color.Death),
          dash: true,
        };
      case "SPECIAL_WEAPON_USES":
        return {
          data: battleStats.map((stat) => stat.special / stat.count),
          color: Color.Special,
        };
      case "SPECIAL_WEAPON_USES_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) => stat.specialTeam / stat.member),
          color: burnColor(Color.Special),
          dash: true,
        };
    }
  };
  const getCoopData = (dimension: CoopDimension) => {
    switch (dimension) {
      case "CLEAR":
        return {
          data: coopStats.map((stat) => (stat.clear * 100) / stat.count),
          color: Color.AccentColor,
          max: 100,
          relative: true,
        };
      case "WAVES_CLEARED":
        return {
          data: coopStats.map((stat) => stat.wave / stat.count),
          color: Color.SalmonRun,
        };
      case "HAZARD_LEVEL":
        return {
          data: coopStats.map((stat) => (stat.hazardLevel * 100) / stat.count),
          color: Color.BigRun,
        };
      case "BOSS_SALMONIDS_DEFEATED":
        return {
          data: coopStats.map((stat) => stat.defeat / stat.count),
          color: Color.KillAndRescue,
        };
      case "BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => stat.defeatTeam / stat.member),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "GOLDEN_EGGS_COLLECTED":
        return {
          data: coopStats.map((stat) => stat.golden / stat.count),
          color: Color.GoldenEgg,
        };
      case "GOLDEN_EGGS_COLLECTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => stat.goldenTeam / stat.member),
          color: burnColor(Color.GoldenEgg),
          dash: true,
        };
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED":
        return {
          data: coopStats.map((stat) => (stat.golden + stat.assist) / stat.count),
          color: Color.GoldenEgg,
        };
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => (stat.goldenTeam + stat.assistTeam) / stat.member),
          color: burnColor(Color.GoldenEgg),
          dash: true,
        };
      case "POWER_EGGS_COLLECTED":
        return {
          data: coopStats.map((stat) => stat.power / stat.count),
          color: Color.PowerEgg,
        };
      case "POWER_EGGS_COLLECTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => stat.powerTeam / stat.member),
          color: burnColor(Color.PowerEgg),
          dash: true,
        };
      case "RESCUED":
        return {
          data: coopStats.map((stat) => stat.rescue / stat.count),
          color: Color.KillAndRescue,
        };
      case "RESCUED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => stat.rescueTeam / stat.member),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "BE_RESCUED":
        return {
          data: coopStats.map((stat) => stat.rescued / stat.count),
          color: Color.Death,
        };
      case "BE_RESCUED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => stat.rescuedTeam / stat.member),
          color: burnColor(Color.Death),
          dash: true,
        };
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
                <Chart
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
                    onPress={() => {
                      onCoopDimensionPress("CLEAR");
                    }}
                  />
                  <ColorFilterButton
                    color={coopDimensions.includes("WAVES_CLEARED") ? Color.SalmonRun : undefined}
                    title={t("waves_cleared")}
                    onPress={() => {
                      onCoopDimensionPress("WAVES_CLEARED");
                    }}
                  />
                  <ColorFilterButton
                    color={coopDimensions.includes("HAZARD_LEVEL") ? Color.BigRun : undefined}
                    title={t("hazard_level")}
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
                <Chart
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
