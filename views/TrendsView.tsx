import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
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
  useTheme,
} from "../components";
import t from "../i18n";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import { burnColor, countBattles, countCoops } from "../utils/ui";
import { ResultProps } from "./ResultView";

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

interface TrendViewProps {
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

type BattleDimension =
  | "VICTORY"
  | "POWER"
  | "TURF_INKED"
  | "TURF_INKED_TEAM_AVERAGE"
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
  const theme = useTheme();

  const [point, setPoint] = useState(20);
  const [trends, setTrends] = useState(false);
  const [group, setGroup] = useState(0);
  const [battleDimensions, setBattleDimensions] = useState<BattleDimension[]>(["VICTORY"]);
  const [coopDimensions, setCoopDimensions] = useState<CoopDimension[]>(["CLEAR"]);

  const split = <T extends VsHistoryDetailResult | CoopHistoryDetailResult>(
    arr: T[],
    count: number,
    group: number
  ) => {
    const result: T[][] = [];
    if (group === 0) {
      const size = Math.max(arr.length / count, 1);
      let start = arr.length - size;
      let n = 0;
      while (start >= 0) {
        const part: T[] = [];
        for (let i = Math.ceil(start); i < start + size && i < arr.length; i++) {
          part.push(arr[i]);
          n++;
        }
        if (part.length > 0) {
          result.push(part.reverse());
        }
        start -= size;
      }
      // HACK: complete remaining elements due to loss of precision.
      if (n < arr.length) {
        if (result.length === count) {
          for (let i = arr.length - n - 1; i >= 0; i--) {
            result[result.length - 1].push(arr[i]);
          }
        } else {
          const part: T[] = [];
          for (let i = arr.length - n - 1; i >= 0; i--) {
            part.push(arr[i]);
          }
          result.push(part);
        }
      }
    } else {
      // Escape splitting by period if there is no result.
      if (arr.length <= 0) {
        return result;
      }
      let stops: number[] = [];
      for (let i = 0; i < count; i++) {
        switch (group) {
          case 1:
            stops.push(dayjs().utc().startOf("day").subtract(i, "day").valueOf());
            break;
          case 2:
            stops.push(dayjs().utc().startOf("week").subtract(i, "week").valueOf());
            break;
          case 3:
            stops.push(dayjs().utc().startOf("month").subtract(i, "month").valueOf());
            break;
          case 4:
            stops.push(
              dayjs().utc().startOf("quarter").subtract(1, "month").subtract(i, "quarter").valueOf()
            );
            break;
          default:
            throw new Error(`unexpected group ${group}`);
        }
      }
      // 1661990400000 represents 2022-9-1.
      stops = stops.filter((stop) => stop >= 1661990400000);
      for (let i = 0; i < stops.length; i++) {
        const begin = stops[i];
        const end = i === 0 ? Number.POSITIVE_INFINITY : stops[i - 1];
        result.push(
          arr.filter((r) => {
            const playedTime = (
              r["vsHistoryDetail"]
                ? r["vsHistoryDetail"]["playedTime"]
                : r["coopHistoryDetail"]["playedTime"]
            ) as string;
            const time = new Date(playedTime).valueOf();
            return time >= begin && time < end;
          })
        );
      }
      result.reverse();
    }
    return result;
  };

  const battles = useMemo(
    () => props.results?.filter((result) => result.battle).map((result) => result.battle!),
    [props.results]
  );
  const battleGroups = useMemo(
    () => (battles ? split(battles, point, group) : []),
    [battles, group]
  );
  const coops = useMemo(
    () => props.results?.filter((result) => result.coop).map((result) => result.coop!),
    [props.results]
  );
  const coopGroups = useMemo(() => (coops ? split(coops, point, group) : []), [coops, group]);

  const battleStats = useMemo(
    () => battleGroups.map((group) => countBattles(group)),
    [battleGroups]
  );
  const coopStats = useMemo(() => coopGroups.map((group) => countCoops(group)), [coopGroups]);

  const rationalize = (n: number) => {
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      return 0;
    }
    return n;
  };
  const getBattleData = (dimension: BattleDimension) => {
    switch (dimension) {
      case "VICTORY":
        return {
          data: battleStats.map((stat) => rationalize((stat.win * 100) / stat.count)),
          color: Color.AccentColor,
          max: 100,
          relative: true,
        };
      case "POWER":
        return {
          data: battleStats.map((stat) => rationalize(stat.power / stat.powerCount)),
          color: Color.AnarchyBattle,
        };
      case "TURF_INKED":
        return {
          data: battleStats.map((stat) => rationalize(stat.turf / (stat.duration / 60))),
          color: Color.AccentColor,
        };
      case "TURF_INKED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) =>
            rationalize(stat.turfTeam / ((stat.member * stat.duration) / 60))
          ),
          color: burnColor(Color.AccentColor),
          dash: true,
        };
      case "SPLATTED":
        return {
          data: battleStats.map((stat) =>
            rationalize((stat.kill - stat.assist) / (stat.duration / 60))
          ),
          color: Color.KillAndRescue,
        };
      case "SPLATTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) =>
            rationalize((stat.killTeam - stat.assistTeam) / ((stat.member * stat.duration) / 60))
          ),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "SPLATTED_INCLUDING_ASSISTED":
        return {
          data: battleStats.map((stat) => rationalize(stat.kill / (stat.duration / 60))),
          color: Color.KillAndRescue,
        };
      case "SPLATTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) =>
            rationalize(stat.killTeam / ((stat.member * stat.duration) / 60))
          ),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "BE_SPLATTED":
        return {
          data: battleStats.map((stat) => rationalize(stat.death / (stat.duration / 60))),
          color: Color.Death,
        };
      case "BE_SPLATTED_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) =>
            rationalize(stat.deathTeam / ((stat.member * stat.duration) / 60))
          ),
          color: burnColor(Color.Death),
          dash: true,
        };
      case "SPECIAL_WEAPON_USES":
        return {
          data: battleStats.map((stat) => rationalize(stat.special / (stat.duration / 60))),
          color: Color.Special,
        };
      case "SPECIAL_WEAPON_USES_TEAM_AVERAGE":
        return {
          data: battleStats.map((stat) =>
            rationalize(stat.specialTeam / ((stat.member * stat.duration) / 60))
          ),
          color: burnColor(Color.Special),
          dash: true,
        };
    }
  };
  const getCoopData = (dimension: CoopDimension) => {
    switch (dimension) {
      case "CLEAR":
        return {
          data: coopStats.map((stat) => rationalize((stat.clear * 100) / stat.count)),
          color: Color.AccentColor,
          max: 100,
          relative: true,
        };
      case "WAVES_CLEARED":
        return {
          data: coopStats.map((stat) => rationalize(stat.wave / (stat.count - stat.deemed))),
          color: Color.SalmonRun,
        };
      case "HAZARD_LEVEL":
        return {
          data: coopStats.map((stat) =>
            rationalize((stat.hazardLevel * 100) / (stat.count - stat.deemed))
          ),
          color: Color.BigRun,
        };
      case "BOSS_SALMONIDS_DEFEATED":
        return {
          data: coopStats.map((stat) => rationalize(stat.defeat / (stat.count - stat.deemed))),
          color: Color.KillAndRescue,
        };
      case "BOSS_SALMONIDS_DEFEATED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => rationalize(stat.defeatTeam / stat.member)),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "GOLDEN_EGGS_COLLECTED":
        return {
          data: coopStats.map((stat) => rationalize(stat.golden / (stat.count - stat.deemed))),
          color: Color.GoldenEgg,
        };
      case "GOLDEN_EGGS_COLLECTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => rationalize(stat.goldenTeam / stat.member)),
          color: burnColor(Color.GoldenEgg),
          dash: true,
        };
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED":
        return {
          data: coopStats.map((stat) =>
            rationalize((stat.golden + stat.assist) / (stat.count - stat.deemed))
          ),
          color: Color.GoldenEgg,
        };
      case "GOLDEN_EGGS_COLLECTED_INCLUDING_ASSISTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) =>
            rationalize((stat.goldenTeam + stat.assistTeam) / stat.member)
          ),
          color: burnColor(Color.GoldenEgg),
          dash: true,
        };
      case "POWER_EGGS_COLLECTED":
        return {
          data: coopStats.map((stat) => rationalize(stat.power / (stat.count - stat.deemed))),
          color: Color.PowerEgg,
        };
      case "POWER_EGGS_COLLECTED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => rationalize(stat.powerTeam / stat.member)),
          color: burnColor(Color.PowerEgg),
          dash: true,
        };
      case "RESCUED":
        return {
          data: coopStats.map((stat) => rationalize(stat.rescue / (stat.count - stat.deemed))),
          color: Color.KillAndRescue,
        };
      case "RESCUED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => rationalize(stat.rescueTeam / stat.member)),
          color: burnColor(Color.KillAndRescue),
          dash: true,
        };
      case "BE_RESCUED":
        return {
          data: coopStats.map((stat) => rationalize(stat.rescued / (stat.count - stat.deemed))),
          color: Color.Death,
        };
      case "BE_RESCUED_TEAM_AVERAGE":
        return {
          data: coopStats.map((stat) => rationalize(stat.rescuedTeam / stat.member)),
          color: burnColor(Color.Death),
          dash: true,
        };
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setPoint(Math.max(Math.round(event.nativeEvent.layout.width / 20), 20));
  };
  const onTrendsPress = () => {
    setTrends(true);
  };
  const onTrendsClose = () => {
    setTrends(false);
  };
  const onGroupChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setGroup(event.nativeEvent.selectedSegmentIndex);
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
      <Modal
        isVisible={trends}
        onClose={onTrendsClose}
        onLayout={onLayout}
        style={ViewStyles.modal2d}
      >
        <VStack style={ViewStyles.mb2}>
          <SegmentedControl
            values={[t("average"), t("day"), t("week"), t("month"), t("season")]}
            selectedIndex={group}
            onChange={onGroupChange}
          />
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={battleGroups.length === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battles?.length ?? 0}</Text>
          </Display>
          {battleGroups.length > 0 && (
            <VStack style={[ViewStyles.rb2, theme.territoryStyle]}>
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
                    color={battleDimensions.includes("POWER") ? Color.AnarchyBattle : undefined}
                    title={`${t("power")}`}
                    onPress={() => {
                      onBattleDimensionPress("POWER");
                    }}
                  />
                  <ColorFilterButton
                    color={
                      battleDimensions.includes("TURF_INKED") ||
                      battleDimensions.includes("TURF_INKED_TEAM_AVERAGE")
                        ? Color.AccentColor
                        : undefined
                    }
                    title={t("turf_inked")}
                    onPress={() => {
                      onBattleDimensionPress("TURF_INKED");
                    }}
                    onLongPress={() => {
                      onBattleDimensionPress("TURF_INKED_TEAM_AVERAGE");
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
                  style={[ViewStyles.rb2, theme.territoryStyle, { height: 150, width: "100%" }]}
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
            <VStack style={[ViewStyles.rb2, theme.territoryStyle]}>
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
                  style={[ViewStyles.rb2, theme.territoryStyle, { height: 150, width: "100%" }]}
                />
              )}
            </VStack>
          )}
        </VStack>
        <VStack center style={(battleGroups.length > 0 || coopGroups.length > 0) && ViewStyles.mb2}>
          <Marquee>{t("trends_notice")}</Marquee>
        </VStack>
        {(battleGroups.length > 0 || coopGroups.length > 0) && (
          <HStack style={ViewStyles.c}>
            <Icon name="info" size={14} color={Color.MiddleTerritory} style={ViewStyles.mr1} />
            <HStack style={ViewStyles.i}>
              <Marquee style={TextStyles.subtle}>{t("trends_notice2")}</Marquee>
            </HStack>
          </HStack>
        )}
      </Modal>
    </Center>
  );
};

export default TrendsView;
