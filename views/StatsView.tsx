import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import { NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import {
  AccordionDisplay,
  Center,
  Display,
  Marquee,
  Modal,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import { countBattles, countCoops } from "../utils/ui";
import { ResultProps } from "./ResultView";

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

interface StatsViewProps {
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
  const [stats, setStats] = useState(false);
  const [group, setGroup] = useState(0);

  const beginTime = useMemo(() => {
    switch (group) {
      case 0:
        return 0;
      case 1:
        return dayjs().utc().startOf("day").valueOf();
      case 2:
        return dayjs().utc().startOf("week").valueOf();
      case 3:
        return dayjs().utc().startOf("month").valueOf();
      case 4:
        return dayjs().utc().startOf("quarter").subtract(1, "month").valueOf();
      default:
        throw new Error(`unexpected group ${group}`);
    }
  }, [group]);

  const battleStats = useMemo(
    () =>
      countBattles(
        (props.results
          ?.map((result) => result.battle)
          .filter((battle) => battle)
          .filter(
            (battle) =>
              beginTime === 0 ||
              new Date(battle!.vsHistoryDetail!.playedTime).valueOf() >= beginTime
          ) ?? []) as VsHistoryDetailResult[]
      ),
    [props.results, group]
  );
  const coopStats = useMemo(
    () =>
      countCoops(
        (props.results
          ?.map((result) => result.coop)
          .filter((coop) => coop)
          .filter(
            (coop) =>
              beginTime === 0 ||
              new Date(coop!.coopHistoryDetail!.playedTime).valueOf() >= beginTime
          ) ?? []) as CoopHistoryDetailResult[]
      ),
    [props.results, group]
  );

  const formatPower = (total: number, max: number, count: number) => {
    return `${max.toFixed(1)} (${(total / count).toFixed(1)})`;
  };
  const formatTotalAndAverage = (total: number, count: number) => {
    if (count === 0) {
      return "0";
    }
    return `${total} (${(total / count).toFixed(1)})`;
  };
  const formatTotalAndAverageKillAndAssist = (kill: number, assist: number, count: number) => {
    if (count === 0) {
      return "0";
    }
    if (assist > 0) {
      return `${kill}(${assist}) (${(kill / count).toFixed(1)}(${(assist / count).toFixed(1)}))`;
    }
    return formatTotalAndAverage(kill, count);
  };
  const formatTotalAndAverageGoldenEggs = (deliver: number, assist: number, count: number) => {
    if (deliver + assist === 0) {
      return <Text numberOfLines={1}>0</Text>;
    }
    return (
      <Text numberOfLines={1}>
        {deliver}
        <Text numberOfLines={1} style={TextStyles.h6}>
          {assist > 0 ? `+${assist}` : ""}
        </Text>{" "}
        ({(deliver / count).toFixed(1)}
        <Text numberOfLines={1} style={TextStyles.h6}>
          {assist > 0 ? `+${(assist / count).toFixed(1)}` : ""}
        </Text>
        )
      </Text>
    );
  };

  const onStatsPress = () => {
    setStats(true);
  };
  const onStatsClose = () => {
    setStats(false);
  };
  const onGroupChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setGroup(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <Center style={props.style}>
      <ToolButton icon="bar-chart-2" title={t("stats")} onPress={onStatsPress} />
      <Modal isVisible={stats} onClose={onStatsClose} style={ViewStyles.modal2d}>
        <VStack style={ViewStyles.mb2}>
          <SegmentedControl
            values={[t("all"), t("day"), t("week"), t("month"), t("season")]}
            selectedIndex={group}
            onChange={onGroupChange}
          />
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={battleStats.count === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battleStats.count}</Text>
          </Display>
          {battleStats.count > 0 && (
            <VStack>
              <Display title={t("victory")}>
                <Text numberOfLines={1}>{battleStats.win}</Text>
              </Display>
              <Display title={t("defeat")}>
                <Text numberOfLines={1}>{battleStats.lose}</Text>
              </Display>
              {battleStats.powerCount > 0 && (
                <Display title={t("power")}>
                  <Text numberOfLines={1}>
                    {formatPower(battleStats.power, battleStats.powerMax, battleStats.powerCount)}
                  </Text>
                </Display>
              )}
              <Display title={t("turf_inked")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.turf, battleStats.duration / 60)}
                </Text>
              </Display>
              <Display title={t("splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverageKillAndAssist(
                    battleStats.kill,
                    battleStats.assist,
                    battleStats.duration / 60
                  )}
                </Text>
              </Display>
              <Display title={t("be_splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.death, battleStats.duration / 60)}
                </Text>
              </Display>
              <Display isLast title={t("special_weapon_uses")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.special, battleStats.duration / 60)}
                </Text>
              </Display>
            </VStack>
          )}
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={coopStats.count === 0} title={t("salmon_run")}>
            <Text numberOfLines={1}>{coopStats.count}</Text>
          </Display>
          {coopStats.count > 0 && (
            <VStack>
              <Display title={t("clear")}>
                <Text numberOfLines={1}>{coopStats.clear}</Text>
              </Display>
              <Display title={t("failure")}>
                <Text numberOfLines={1}>{coopStats.count - coopStats.clear}</Text>
              </Display>
              <VStack>
                <Display title={t("waves_cleared")}>
                  <Text numberOfLines={1}>
                    {formatTotalAndAverage(coopStats.wave, coopStats.count - coopStats.deemed)}
                  </Text>
                </Display>
                <AccordionDisplay
                  title={t("boss_salmonids_defeated")}
                  subChildren={coopStats.bosses.map((boss) => (
                    <Display key={boss.id} level={1} title={t(boss.id)}>
                      <Text numberOfLines={1}>{boss.defeat}</Text>
                    </Display>
                  ))}
                >
                  <Text numberOfLines={1}>
                    {formatTotalAndAverage(coopStats.defeat, coopStats.count - coopStats.deemed)}
                  </Text>
                </AccordionDisplay>
                <AccordionDisplay
                  title={t("king_salmonids_defeated")}
                  subChildren={coopStats.kings.map((king) => (
                    <Display key={king.id} level={1} title={t(king.id)}>
                      <Text numberOfLines={1}>{king.defeat}</Text>
                    </Display>
                  ))}
                >
                  <Text numberOfLines={1}>{coopStats.king}</Text>
                </AccordionDisplay>
                <Display title={t("golden_eggs_collected")}>
                  {formatTotalAndAverageGoldenEggs(
                    coopStats.golden,
                    coopStats.assist,
                    coopStats.count - coopStats.deemed
                  )}
                </Display>
                <Display title={t("power_eggs_collected")}>
                  <Text numberOfLines={1}>
                    {formatTotalAndAverage(coopStats.power, coopStats.count - coopStats.deemed)}
                  </Text>
                </Display>
                <Display title={t("rescued")}>
                  <Text numberOfLines={1}>
                    {formatTotalAndAverage(coopStats.rescue, coopStats.count - coopStats.deemed)}
                  </Text>
                </Display>
                <Display isLast title={t("be_rescued")}>
                  <Text numberOfLines={1}>
                    {formatTotalAndAverage(coopStats.rescued, coopStats.count - coopStats.deemed)}
                  </Text>
                </Display>
              </VStack>
            </VStack>
          )}
        </VStack>
        <VStack center>
          <Marquee>{t("stats_notice")}</Marquee>
        </VStack>
      </Modal>
    </Center>
  );
};

export default StatsView;
