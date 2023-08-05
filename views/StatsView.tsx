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
import { countBattles, countCoops, roundPower } from "../utils/ui";
import { ResultProps } from "./ResultView";

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

interface StatsModalProps {
  results?: ResultProps[];
  hideEmpty?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
}

const StatsModal = (props: StatsModalProps) => {
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

  const formatPower = (total: number, max: number, count: number) => {
    return `${roundPower(max)} (${roundPower(total / count)})`;
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
  const formatWinRateAndTotal = (win: number, total: number) => {
    return `${win} (${((win / total) * 100).toFixed(1)}%) / ${total}`;
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
  const formatWaterLevel = (level: number) => {
    switch (level) {
      case 0:
        return t("low_tide");
      case 1:
        return t("normal");
      case 2:
        return t("high_tide");
      default:
        throw new Error(`unexpected water level ${level}`);
    }
  };

  return (
    <Modal
      isVisible={props.isVisible}
      onClose={props.onClose}
      onModalHide={props.onModalHide}
      style={ViewStyles.modal2d}
    >
      {props.children}
      {(!props.hideEmpty || battleStats.count > 0) && (
        <VStack style={ViewStyles.mb2}>
          <Display first last={battleStats.count === 0} title={t("battle")}>
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
              {battleStats.power.count > 0 && (
                <Display title={t("power")}>
                  <Text numberOfLines={1}>
                    {formatPower(
                      battleStats.power.total,
                      battleStats.power.max,
                      battleStats.power.count
                    )}
                  </Text>
                </Display>
              )}
              <Display title={t("turf_inked")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.self.turf, battleStats.duration / 60)}
                </Text>
              </Display>
              <Display title={t("splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverageKillAndAssist(
                    battleStats.self.kill,
                    battleStats.self.assist,
                    battleStats.duration / 60
                  )}
                </Text>
              </Display>
              <Display title={t("be_splatted")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.self.death, battleStats.duration / 60)}
                </Text>
              </Display>
              <Display last={battleStats.stages.length === 0} title={t("special_weapon_uses")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(battleStats.self.special, battleStats.duration / 60)}
                </Text>
              </Display>
              {battleStats.stages.length > 0 && (
                <VStack>
                  <AccordionDisplay
                    title={t("stage_stats")}
                    subChildren={battleStats.stages.map((stage) => (
                      <AccordionDisplay
                        key={stage.id}
                        level={1}
                        title={t(stage.id)}
                        subChildren={stage.rules.map((rule) => (
                          <Display key={rule.id} level={2} title={t(rule.id)}>
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(rule.win, rule.win + rule.lose)}
                            </Text>
                          </Display>
                        ))}
                      >
                        <Text numberOfLines={1}>
                          {formatWinRateAndTotal(
                            stage.rules.reduce((prev, current) => prev + current.win, 0),
                            stage.rules.reduce(
                              (prev, current) => prev + current.win + current.lose,
                              0
                            )
                          )}
                        </Text>
                      </AccordionDisplay>
                    ))}
                  />
                  <AccordionDisplay
                    last
                    title={t("weapon_stats")}
                    subChildren={battleStats.weapons.map((weapon, i, weapons) => (
                      <AccordionDisplay
                        key={weapon.id}
                        last={i === weapons.length - 1}
                        level={1}
                        title={t(weapon.id)}
                        subChildren={weapon.rules.map((rule, j, rules) => (
                          <Display
                            key={rule.id}
                            last={i === weapons.length - 1 && j === rules.length - 1}
                            level={2}
                            title={t(rule.id)}
                          >
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(rule.win, rule.win + rule.lose)}
                            </Text>
                          </Display>
                        ))}
                      >
                        <Text numberOfLines={1}>
                          {formatWinRateAndTotal(
                            weapon.rules.reduce((prev, current) => prev + current.win, 0),
                            weapon.rules.reduce(
                              (prev, current) => prev + current.win + current.lose,
                              0
                            )
                          )}
                        </Text>
                      </AccordionDisplay>
                    ))}
                  />
                </VStack>
              )}
            </VStack>
          )}
        </VStack>
      )}
      {(!props.hideEmpty || coopStats.count > 0) && (
        <VStack style={ViewStyles.mb2}>
          <Display first last={coopStats.count === 0} title={t("salmon_run")}>
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
                  {formatTotalAndAverage(coopStats.self.defeat, coopStats.count - coopStats.deemed)}
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
                  coopStats.self.golden,
                  coopStats.self.assist,
                  coopStats.count - coopStats.deemed
                )}
              </Display>
              <Display title={t("power_eggs_collected")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.self.power, coopStats.count - coopStats.deemed)}
                </Text>
              </Display>
              <Display title={t("rescued")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(coopStats.self.rescue, coopStats.count - coopStats.deemed)}
                </Text>
              </Display>
              <Display last={coopStats.waves.length === 0} title={t("be_rescued")}>
                <Text numberOfLines={1}>
                  {formatTotalAndAverage(
                    coopStats.self.rescued,
                    coopStats.count - coopStats.deemed
                  )}
                </Text>
              </Display>
              {coopStats.waves.length > 0 && (
                <VStack>
                  <AccordionDisplay
                    title={t("wave_stats")}
                    subChildren={coopStats.waves.map((wave) => (
                      <AccordionDisplay
                        key={wave.id}
                        level={1}
                        title={t(wave.id)}
                        subChildren={wave.levels.map((level) => (
                          <Display key={level.id} level={2} title={formatWaterLevel(level.id)}>
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(level.clear, level.appear)}
                            </Text>
                          </Display>
                        ))}
                      >
                        <Text numberOfLines={1}>
                          {formatWinRateAndTotal(
                            wave.levels.reduce((prev, current) => prev + current.clear, 0),
                            wave.levels.reduce((prev, current) => prev + current.appear, 0)
                          )}
                        </Text>
                      </AccordionDisplay>
                    ))}
                  />
                  <AccordionDisplay
                    title={t("stage_stats")}
                    subChildren={coopStats.stages.map((stage) => (
                      <Display key={stage.id} level={1} title={t(stage.id)}>
                        <Text numberOfLines={1}>{stage.count}</Text>
                      </Display>
                    ))}
                  />
                  <AccordionDisplay
                    title={t("supplied_weapons")}
                    subChildren={coopStats.weapons.map((weapon) => (
                      <Display key={weapon.id} level={1} title={t(weapon.id)}>
                        <Text numberOfLines={1}>{weapon.count}</Text>
                      </Display>
                    ))}
                  />
                  <AccordionDisplay
                    last
                    title={t("supplied_special_weapons")}
                    subChildren={coopStats.specialWeapons.map(
                      (specialWeapon, i, specialWeapons) => (
                        <Display
                          key={specialWeapon.id}
                          last={i === specialWeapons.length - 1}
                          level={1}
                          title={t(specialWeapon.id)}
                        >
                          <Text numberOfLines={1}>{specialWeapon.count}</Text>
                        </Display>
                      )
                    )}
                  />
                </VStack>
              )}
            </VStack>
          )}
        </VStack>
      )}
      <VStack center>
        <Marquee>{t("stats_notice")}</Marquee>
      </VStack>
    </Modal>
  );
};

interface StatsViewProps {
  disabled?: boolean;
  onResults: () => Promise<ResultProps[]>;
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
  const [results, setResults] = useState<ResultProps[]>();
  const [loading, setLoading] = useState(false);
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

  const filtered = useMemo(() => {
    if (!results) {
      return undefined;
    }
    return results.filter((result) => {
      if (beginTime === 0) {
        return true;
      }
      if (result.battle) {
        return new Date(result.battle.vsHistoryDetail!.playedTime).valueOf() >= beginTime;
      }
      return new Date(result.coop!.coopHistoryDetail!.playedTime).valueOf() >= beginTime;
    });
  }, [results, beginTime]);

  const onStatsPress = async () => {
    setLoading(true);
    const results = await props.onResults();
    setResults(results);
    setStats(true);
    setLoading(false);
  };
  const onStatsClose = () => {
    setStats(false);
  };
  const onModalHide = () => {
    setResults(undefined);
  };
  const onGroupChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setGroup(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <Center style={props.style}>
      <ToolButton
        disabled={props.disabled}
        loading={loading}
        icon="bar-chart-2"
        title={t("stats")}
        onPress={onStatsPress}
      />
      <StatsModal
        results={filtered}
        isVisible={stats}
        onClose={onStatsClose}
        onModalHide={onModalHide}
      >
        <VStack style={ViewStyles.mb2}>
          <SegmentedControl
            values={[t("all"), t("day"), t("week"), t("month"), t("season")]}
            selectedIndex={group}
            onChange={onGroupChange}
          />
        </VStack>
      </StatsModal>
    </Center>
  );
};

export { StatsModal };
export default StatsView;
