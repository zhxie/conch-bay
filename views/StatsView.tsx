import { useState } from "react";
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
import { Judgement } from "../models/types";
import { decode64Index } from "../utils/codec";
import { getVsSelfPlayer } from "../utils/ui";
import { ResultProps } from "./ResultView";

interface StatsViewProps {
  count: number;
  total: number;
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
  const [stats, setStats] = useState(false);

  const formatBattle = () => {
    let battle = 0,
      win = 0,
      lose = 0,
      kill = 0,
      assist = 0,
      death = 0,
      special = 0;
    props.results
      ?.filter((result) => result.battle)
      .forEach((result) => {
        battle += 1;
        switch (result.battle!.vsHistoryDetail!.judgement as Judgement) {
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
        kill += getVsSelfPlayer(result.battle!).result?.kill ?? 0;
        assist += getVsSelfPlayer(result.battle!).result?.assist ?? 0;
        death += getVsSelfPlayer(result.battle!).result?.death ?? 0;
        special += getVsSelfPlayer(result.battle!).result?.special ?? 0;
      });
    return {
      count: battle,
      win,
      lose,
      kill,
      assist,
      death,
      special,
    };
  };
  const formatCoop = () => {
    let coop = 0,
      clear = 0,
      wave = 0,
      bossDefeat = 0,
      kingDefeat = 0,
      deliverGoldenEgg = 0,
      assistGoldenEgg = 0,
      powerEgg = 0,
      rescue = 0,
      rescued = 0;
    const bossMap = new Map(),
      kingMap = new Map();
    props.results
      ?.filter((result) => result.coop)
      .forEach((result) => {
        coop += 1;
        const resultWave = result.coop!.coopHistoryDetail!.resultWave;
        if (resultWave >= 0) {
          if (resultWave === 0) {
            clear += 1;
            wave += result.coop!.coopHistoryDetail!.waveResults.length;
          }
          wave += resultWave - 1;
        }
        bossDefeat += result.coop!.coopHistoryDetail!.myResult.defeatEnemyCount;
        for (const enemyResult of result.coop!.coopHistoryDetail!.enemyResults) {
          if (enemyResult.defeatCount > 0) {
            if (!bossMap.has(enemyResult.enemy.id)) {
              bossMap.set(enemyResult.enemy.id, 0);
            }
            bossMap.set(enemyResult.enemy.id, bossMap.get(enemyResult.enemy.id) + 1);
          }
        }
        kingDefeat += result.coop!.coopHistoryDetail!.bossResult?.hasDefeatBoss ?? false ? 1 : 0;
        if (result.coop!.coopHistoryDetail!.bossResult?.hasDefeatBoss ?? false) {
          if (!kingMap.has(result.coop!.coopHistoryDetail!.bossResult!.boss.id)) {
            kingMap.set(result.coop!.coopHistoryDetail!.bossResult!.boss.id, 0);
          }
          kingMap.set(
            result.coop!.coopHistoryDetail!.bossResult!.boss.id,
            kingMap.get(result.coop!.coopHistoryDetail!.bossResult!.boss.id) + 1
          );
        }
        deliverGoldenEgg += result.coop!.coopHistoryDetail!.myResult.goldenDeliverCount;
        assistGoldenEgg += result.coop!.coopHistoryDetail!.myResult.goldenAssistCount;
        powerEgg += result.coop!.coopHistoryDetail!.myResult.deliverCount;
        rescue += result.coop!.coopHistoryDetail!.myResult.rescueCount;
        rescued += result.coop!.coopHistoryDetail!.myResult.rescuedCount;
      });
    const bossDefeats = Array.from(bossMap, (boss) => ({
      id: boss[0],
      count: boss[1],
    }));
    bossDefeats.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
    const kingDefeats = Array.from(kingMap, (king) => ({
      id: king[0],
      count: king[1],
    }));
    kingDefeats.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
    return {
      count: coop,
      clear,
      wave,
      bossDefeat,
      bossDefeats,
      kingDefeat,
      kingDefeats,
      deliverGoldenEgg,
      assistGoldenEgg,
      powerEgg,
      rescue,
      rescued,
    };
  };

  const battle = formatBattle();
  const coop = formatCoop();

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
          <Display isFirst title={t("count")}>
            <Text numberOfLines={1}>{props.results?.length ?? 0}</Text>
          </Display>
          <Display isLast title={t("database")}>
            <Text numberOfLines={1}>{`${props.count} / ${props.total}`}</Text>
          </Display>
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={battle.count === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battle.count}</Text>
          </Display>
          {battle.count > 0 && (
            <VStack>
              <Display title={t("victory")}>
                <Text numberOfLines={1}>{battle.win}</Text>
              </Display>
              <Display title={t("defeat")}>
                <Text numberOfLines={1}>{battle.lose}</Text>
              </Display>
              <Display title={t("splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverageKillAndAssist(battle.kill, battle.assist, battle.count)}
                </Text>
              </Display>
              <Display title={t("be_splatted")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(battle.death, battle.count)}</Text>
              </Display>
              <Display isLast title={t("special_weapon_uses")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(battle.special, battle.count)}</Text>
              </Display>
            </VStack>
          )}
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={coop.count === 0} title={t("salmon_run")}>
            <Text numberOfLines={1}>{coop.count}</Text>
          </Display>
          {coop.count > 0 && (
            <VStack>
              <Display title={t("clear")}>
                <Text numberOfLines={1}>{coop.clear}</Text>
              </Display>
              <Display title={t("failure")}>
                <Text numberOfLines={1}>{coop.count - coop.clear}</Text>
              </Display>
              <Display title={t("waves_cleared")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(coop.wave, coop.count)}</Text>
              </Display>
              <AccordionDisplay
                title={t("boss_salmonids_defeated")}
                subChildren={coop.bossDefeats.map((bossDefeat) => (
                  <Display key={bossDefeat.id} title={t(bossDefeat.id)}>
                    <Text numberOfLines={1}>{bossDefeat.count}</Text>
                  </Display>
                ))}
              >
                <Text numberOfLines={1}>{formatTotalAndAverage(coop.bossDefeat, coop.count)}</Text>
              </AccordionDisplay>
              <AccordionDisplay
                title={t("king_salmonids_defeated")}
                subChildren={coop.kingDefeats.map((kingDefeat) => (
                  <Display key={kingDefeat.id} title={t(kingDefeat.id)}>
                    <Text numberOfLines={1}>{kingDefeat.count}</Text>
                  </Display>
                ))}
              >
                <Text numberOfLines={1}>{coop.kingDefeat}</Text>
              </AccordionDisplay>
              <Display title={t("golden_eggs_collected")}>
                {formatTotalAndAverageGoldenEggs(
                  coop.deliverGoldenEgg,
                  coop.assistGoldenEgg,
                  coop.count
                )}
              </Display>
              <Display title={t("power_eggs_collected")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(coop.powerEgg, coop.count)}</Text>
              </Display>
              <Display title={t("rescued")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(coop.rescue, coop.count)}</Text>
              </Display>
              <Display isLast title={t("be_rescued")}>
                <Text numberOfLines={1}>{formatTotalAndAverage(coop.rescued, coop.count)}</Text>
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
