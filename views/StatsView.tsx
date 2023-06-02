import { useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  AccordionDisplay,
  Center,
  Display,
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

interface StatsViewProps {
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
  const [stats, setStats] = useState(false);

  const battleStats = useMemo(
    () =>
      countBattles(
        (props.results?.map((result) => result.battle).filter((battle) => battle) ??
          []) as VsHistoryDetailResult[]
      ),
    [props.results]
  );
  const coopStats = useMemo(
    () =>
      countCoops(
        (props.results?.map((result) => result.coop).filter((coop) => coop) ??
          []) as CoopHistoryDetailResult[]
      ),
    [props.results]
  );

  const onStatsPress = () => {
    setStats(true);
  };
  const onStatsClose = () => {
    setStats(false);
  };

  const formatTotalAndAverage = (total: number, count: number) => {
    if (count === 0) {
      return total;
    }
    return `${total} (${(total / count).toFixed(1)})`;
  };
  const formatTotalAndAverageKillAndAssist = (kill: number, assist: number, count: number) => {
    if (count === 0) {
      if (assist > 0) {
        return `${kill}(${assist})`;
      }
      return kill;
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

  return (
    <Center style={props.style}>
      <ToolButton icon="bar-chart-2" title={t("stats")} onPress={onStatsPress} />
      <Modal isVisible={stats} onClose={onStatsClose} style={ViewStyles.modal2d}>
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
              <Display title={t("power")}>
                <Text numberOfLines={1}>{`${battleStats.powerMax.toFixed(1)} (${(
                  battleStats.power / Math.max(battleStats.powerCount, 1)
                ).toFixed(1)})`}</Text>
              </Display>
              <Display title={t("splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverageKillAndAssist(
                    battleStats.kill,
                    battleStats.assist,
                    battleStats.count
                  )}
                </Text>
              </Display>
              <Display title={t("be_splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.death, battleStats.count)}
                </Text>
              </Display>
              <Display isLast title={t("special_weapon_uses")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.special, battleStats.count)}
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
              <Display title={t("waves_cleared")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.wave, coopStats.count)}
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
                  {formatTotalAndAverage(coopStats.defeat, coopStats.count)}
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
                  coopStats.count
                )}
              </Display>
              <Display title={t("power_eggs_collected")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.power, coopStats.count)}
                </Text>
              </Display>
              <Display title={t("rescued")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.rescue, coopStats.count)}
                </Text>
              </Display>
              <Display isLast title={t("be_rescued")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.rescued, coopStats.count)}
                </Text>
              </Display>
            </VStack>
          )}
        </VStack>
        <Text center>{t("stats_notice")}</Text>
      </Modal>
    </Center>
  );
};

export default StatsView;
