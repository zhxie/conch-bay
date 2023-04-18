import { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
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
import { Judgement } from "../models/types";
import { getVsSelfPlayer } from "../utils/ui";
import { ResultProps } from "./ResultView";

interface StatsViewProps {
  count: number;
  total: number;
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}
interface CountProps {
  battle: {
    count: number;
    win: number;
    lose: number;
    kill: number;
    assist: number;
    death: number;
    special: number;
  };
  coop: {
    count: number;
    clear: number;
    wave: number;
    defeat: number;
    deliverGoldenEgg: number;
    assistGoldenEgg: number;
    powerEgg: number;
    rescue: number;
    rescued: number;
  };
}

const StatsView = (props: StatsViewProps) => {
  const [stats, setStats] = useState(false);
  const [count, setCount] = useState<CountProps>();

  const onStatsPress = () => {
    let battle = 0,
      win = 0,
      lose = 0,
      kill = 0,
      assist = 0,
      death = 0,
      special = 0,
      coop = 0,
      clear = 0,
      wave = 0,
      defeat = 0,
      deliverGoldenEgg = 0,
      assistGoldenEgg = 0,
      powerEgg = 0,
      rescue = 0,
      rescued = 0;
    props.results?.forEach((result) => {
      if (result.battle) {
        battle += 1;
        switch (result.battle.vsHistoryDetail!.judgement as Judgement) {
          case Judgement.WIN:
            win += 1;
            break;
          case Judgement.LOSE:
          case Judgement.DEEMED_LOSE:
          case Judgement.EXEMPTED_LOSE:
            lose += 1;
            break;
          case Judgement.DRAW:
            break;
        }
        kill += getVsSelfPlayer(result.battle).result?.kill ?? 0;
        assist += getVsSelfPlayer(result.battle).result?.assist ?? 0;
        death += getVsSelfPlayer(result.battle).result?.death ?? 0;
        special += getVsSelfPlayer(result.battle).result?.special ?? 0;
      } else {
        coop += 1;
        const resultWave = result.coop!.coopHistoryDetail!.resultWave;
        if (resultWave >= 0) {
          if (resultWave === 0) {
            clear += 1;
            wave += result.coop!.coopHistoryDetail!.waveResults.length;
          }
          wave += resultWave - 1;
        }
        defeat += result.coop!.coopHistoryDetail!.myResult.defeatEnemyCount;
        deliverGoldenEgg += result.coop!.coopHistoryDetail!.myResult.goldenDeliverCount;
        assistGoldenEgg += result.coop!.coopHistoryDetail!.myResult.goldenAssistCount;
        powerEgg += result.coop!.coopHistoryDetail!.myResult.deliverCount;
        rescue += result.coop!.coopHistoryDetail!.myResult.rescueCount;
        rescued += result.coop!.coopHistoryDetail!.myResult.rescuedCount;
      }
    });
    setCount({
      battle: {
        count: battle,
        win,
        lose,
        kill,
        assist,
        death,
        special,
      },
      coop: {
        count: coop,
        clear,
        wave,
        defeat,
        deliverGoldenEgg,
        assistGoldenEgg,
        powerEgg,
        rescue,
        rescued,
      },
    });
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
        <VStack style={[ViewStyles.mb2, ViewStyles.wf]}>
          <Display isFirst title={t("count")}>
            <Text numberOfLines={1}>{props.results?.length ?? 0}</Text>
          </Display>
          <Display isLast title={t("database")}>
            <Text numberOfLines={1}>{`${props.count} / ${props.total}`}</Text>
          </Display>
        </VStack>
        {!!count && (
          <VStack style={[ViewStyles.mb2, ViewStyles.wf]}>
            <VStack style={ViewStyles.mb2}>
              <Display isFirst isLast={count.battle.count === 0} title={t("battle")}>
                <Text numberOfLines={1}>{count.battle.count}</Text>
              </Display>
              {count.battle.count > 0 && (
                <VStack>
                  <Display title={t("victory")}>
                    <Text numberOfLines={1}>{count.battle.win}</Text>
                  </Display>
                  <Display title={t("defeat")}>
                    <Text numberOfLines={1}>{count.battle.lose}</Text>
                  </Display>
                  <Display title={t("splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverageKillAndAssist(
                        count.battle.kill,
                        count.battle.assist,
                        count.battle.count
                      )}
                    </Text>
                  </Display>
                  <Display title={t("be_splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.battle.death, count.battle.count)}
                    </Text>
                  </Display>
                  <Display isLast title={t("special_weapon_uses")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.battle.special, count.battle.count)}
                    </Text>
                  </Display>
                </VStack>
              )}
            </VStack>
            <VStack>
              <Display isFirst isLast={count.coop.count === 0} title={t("salmon_run")}>
                <Text numberOfLines={1}>{count.coop.count}</Text>
              </Display>
              {count.coop.count > 0 && (
                <VStack>
                  <Display title={t("clear")}>
                    <Text numberOfLines={1}>{count.coop.clear}</Text>
                  </Display>
                  <Display title={t("failure")}>
                    <Text numberOfLines={1}>{count.coop.count - count.coop.clear}</Text>
                  </Display>
                  <Display title={t("waves_cleared")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.coop.wave, count.coop.count)}
                    </Text>
                  </Display>
                  <Display title={t("boss_salmonids_defeated")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.coop.defeat, count.coop.count)}
                    </Text>
                  </Display>
                  <Display title={t("golden_eggs_collected")}>
                    {formatTotalAndAverageGoldenEggs(
                      count.coop.deliverGoldenEgg,
                      count.coop.assistGoldenEgg,
                      count.coop.count
                    )}
                  </Display>
                  <Display title={t("power_eggs_collected")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.coop.powerEgg, count.coop.count)}
                    </Text>
                  </Display>
                  <Display title={t("rescued")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.coop.rescue, count.coop.count)}
                    </Text>
                  </Display>
                  <Display isLast title={t("be_rescued")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(count.coop.rescued, count.coop.count)}
                    </Text>
                  </Display>
                </VStack>
              )}
            </VStack>
          </VStack>
        )}
        <Text center>{t("stats_notice")}</Text>
      </Modal>
    </Center>
  );
};

export default StatsView;
