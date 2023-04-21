import { useState } from "react";
import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  AccordionDisplay,
  AreaChart,
  Center,
  Color,
  Display,
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
  count: number;
  total: number;
  results?: ResultProps[];
  style?: StyleProp<ViewStyle>;
}

const TrendView = (props: TrendViewProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  const [trend, setTrend] = useState(false);

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

  const battles = props.results?.filter((result) => result.battle).map((result) => result.battle!);
  const battleGroups = battles ? split(battles, 20) : [];
  const coops = props.results?.filter((result) => result.coop).map((result) => result.coop!);
  const coopGroups = coops ? split(coops, 20) : [];

  const onTrendPress = () => {
    setTrend(true);
  };
  const onTrendClose = () => {
    setTrend(false);
  };

  return (
    <Center style={props.style}>
      <ToolButton icon="trending-up" title={t("trend")} onPress={onTrendPress} />
      <Modal isVisible={trend} onClose={onTrendClose} style={ViewStyles.modal2d}>
        <VStack style={[ViewStyles.mb2, ViewStyles.wf]}>
          <Display isFirst title={t("count")}>
            <Text numberOfLines={1}>{props.results?.length ?? 0}</Text>
          </Display>
          <Display isLast title={t("database")}>
            <Text numberOfLines={1}>{`${props.count} / ${props.total}`}</Text>
          </Display>
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={!battles || battles.length === 0} title={t("battle")}>
            <Text numberOfLines={1}>{battles?.length ?? 0}</Text>
          </Display>
          {battleGroups.length > 0 && (
            <VStack>
              <AccordionDisplay
                title={t("victory")}
                subChildren={
                  <AreaChart
                    data={battleGroups
                      .map(
                        (battleGroup) =>
                          battleGroup
                            .map((battle) => (battle.vsHistoryDetail!.judgement == "WIN" ? 1 : 0))
                            .reduce((prev: number, current) => prev + current, 0) /
                          battleGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    max={1}
                    color={Color.AccentColor}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("splatted")}
                subChildren={
                  <AreaChart
                    data={battleGroups
                      .map(
                        (battleGroup) =>
                          battleGroup
                            .map((battle) => getVsSelfPlayer(battle).result?.kill ?? 0)
                            .reduce((prev, current) => prev + current, 0) / battleGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.KillAndRescue}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("splatted_including_assisted")}
                subChildren={
                  <AreaChart
                    data={battleGroups
                      .map(
                        (battleGroup) =>
                          battleGroup
                            .map(
                              (battle) =>
                                (getVsSelfPlayer(battle).result?.kill ?? 0) +
                                (getVsSelfPlayer(battle).result?.assist ?? 0)
                            )
                            .reduce((prev, current) => prev + current, 0) / battleGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.KillAndRescue}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("be_splatted")}
                subChildren={
                  <AreaChart
                    data={battleGroups
                      .map(
                        (battleGroup) =>
                          battleGroup
                            .map((battle) => getVsSelfPlayer(battle).result?.death ?? 0)
                            .reduce((prev, current) => prev + current, 0) / battleGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.Death}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("special_weapon_uses")}
                isLast
                subChildren={
                  <AreaChart
                    data={battleGroups
                      .map(
                        (battleGroup) =>
                          battleGroup
                            .map((battle) => getVsSelfPlayer(battle).result?.special ?? 0)
                            .reduce((prev, current) => prev + current, 0) / battleGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.Special}
                    padding={{ top: 10, bottom: 10 }}
                    style={[ViewStyles.rb2, style, { height: 150, width: "100%" }]}
                  />
                }
              />
            </VStack>
          )}
        </VStack>
        <VStack style={ViewStyles.mb2}>
          <Display isFirst isLast={!coops || coops.length === 0} title={t("salmon_run")}>
            <Text numberOfLines={1}>{coops?.length ?? 0}</Text>
          </Display>
          {coopGroups.length > 0 && (
            <VStack>
              <AccordionDisplay
                title={t("clear")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => (coop.coopHistoryDetail!.resultWave === 0 ? 1 : 0))
                            .reduce((prev: number, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    max={1}
                    color={Color.AccentColor}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("waves_cleared")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => {
                              if (coop.coopHistoryDetail!.resultWave >= 0) {
                                if (coop.coopHistoryDetail!.resultWave == 0) {
                                  return coop.coopHistoryDetail!.waveResults.length;
                                }
                                return coop.coopHistoryDetail!.resultWave - 1;
                              }
                              return 0;
                            })
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    max={Math.max(
                      ...coops!.map((coop) => coop.coopHistoryDetail!.waveResults.length)
                    )}
                    color={Color.SalmonRun}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("boss_salmonids_defeated")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => coop.coopHistoryDetail!.myResult.defeatEnemyCount)
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.KillAndRescue}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("golden_eggs_collected")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => coop.coopHistoryDetail!.myResult.goldenDeliverCount)
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.GoldenEgg}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("golden_eggs_collected_including_assisted")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map(
                              (coop) =>
                                coop.coopHistoryDetail!.myResult.goldenDeliverCount +
                                coop.coopHistoryDetail!.myResult.goldenAssistCount
                            )
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.GoldenEgg}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("power_eggs_collected")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => coop.coopHistoryDetail!.myResult.deliverCount)
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.PowerEgg}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("rescued")}
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => coop.coopHistoryDetail!.myResult.rescueCount)
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.KillAndRescue}
                    padding={{ top: 10, bottom: 10 }}
                    style={[style, { height: 150, width: "100%" }]}
                  />
                }
              />
              <AccordionDisplay
                title={t("be_rescued")}
                isLast
                subChildren={
                  <AreaChart
                    data={coopGroups
                      .map(
                        (coopGroup) =>
                          coopGroup
                            .map((coop) => coop.coopHistoryDetail!.myResult.rescuedCount)
                            .reduce((prev, current) => prev + current, 0) / coopGroup.length
                      )
                      .map((value, i) => ({ x: i, y: value }))}
                    color={Color.Death}
                    padding={{ top: 10, bottom: 10 }}
                    style={[ViewStyles.rb2, style, { height: 150, width: "100%" }]}
                  />
                }
              />
            </VStack>
          )}
        </VStack>
        <Text center>{t("stats_notice")}</Text>
      </Modal>
    </Center>
  );
};

export default TrendView;
