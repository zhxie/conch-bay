import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import {
  AccordionDisplay,
  Center,
  Circle,
  Color,
  Display,
  Marquee,
  Modal,
  Notice,
  SalmonRunSwitcher,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { BattleStats, CoopStats, Stats, addBattleStats, addCoopStats } from "../utils/stats";
import { roundPower } from "../utils/ui";

interface StatsModalProps {
  stats?: Stats[];
  dimension?: number;
  hideEmpty?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const StatsModal = (props: StatsModalProps) => {
  const battlesStats = useMemo(
    () =>
      addBattleStats(
        ...((props.stats?.map((result) => result.battle).filter((battle) => battle) ??
          []) as BattleStats[])
      ),
    [props.stats]
  );
  const coopsStats = useMemo(
    () =>
      addCoopStats(
        ...((props.stats?.map((result) => result.coop).filter((coop) => coop) ?? []) as CoopStats[])
      ),
    [props.stats]
  );

  const battleDimension = useMemo(() => {
    switch (props.dimension || 0) {
      case 0:
        return battlesStats.self;
      case 1:
        return battlesStats.team;
      default:
        throw new Error(`unexpected dimension ${props.dimension}`);
    }
  }, [battlesStats, props.dimension]);
  const coopDimension = useMemo(() => {
    switch (props.dimension || 0) {
      case 0:
        return coopsStats.self;
      case 1:
        return coopsStats.team;
      default:
        throw new Error(`unexpected dimension ${props.dimension}`);
    }
  }, [coopsStats, props.dimension]);

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
      <SalmonRunSwitcher>
        <>
          {(!props.hideEmpty || battlesStats.count > 0) && (
            <VStack style={ViewStyles.mb2}>
              <Display first last={battlesStats.count === 0} title={t("battle")}>
                <Text numberOfLines={1}>{battlesStats.count}</Text>
              </Display>
              {battlesStats.count > 0 && (
                <VStack>
                  <Display title={t("victory")}>
                    <Text numberOfLines={1}>{battlesStats.win}</Text>
                  </Display>
                  <Display title={t("defeat")}>
                    <Text numberOfLines={1}>{battlesStats.lose}</Text>
                  </Display>
                  {battlesStats.power.count > 0 && (
                    <Display title={t("power")}>
                      <Text numberOfLines={1}>
                        {formatPower(
                          battlesStats.power.total,
                          battlesStats.power.max,
                          battlesStats.power.count
                        )}
                      </Text>
                    </Display>
                  )}
                  <Display title={t("turf_inked")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(battleDimension.turf, battlesStats.duration / 60)}
                    </Text>
                  </Display>
                  <Display title={t("splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverageKillAndAssist(
                        battleDimension.kill,
                        battleDimension.assist,
                        battlesStats.duration / 60
                      )}
                    </Text>
                  </Display>
                  <Display title={t("be_splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(battleDimension.death, battlesStats.duration / 60)}
                    </Text>
                  </Display>
                  <Display last={battlesStats.stages.length === 0} title={t("special_weapon_uses")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(battleDimension.special, battlesStats.duration / 60)}
                    </Text>
                  </Display>
                  {battlesStats.stages.length > 0 && (
                    <VStack>
                      <AccordionDisplay
                        title={t("stage_stats")}
                        subChildren={battlesStats.stages.map((stage) => (
                          <AccordionDisplay
                            key={stage.id}
                            level={1}
                            title={t(stage.id)}
                            subChildren={stage.rules.map((rule) => (
                              <Display key={rule.id} level={2} title={t(rule.id)}>
                                <Text numberOfLines={1}>
                                  {formatWinRateAndTotal(rule.win, rule.count)}
                                </Text>
                              </Display>
                            ))}
                          >
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(
                                stage.rules.reduce((prev, current) => prev + current.win, 0),
                                stage.rules.reduce((prev, current) => prev + current.count, 0)
                              )}
                            </Text>
                          </AccordionDisplay>
                        ))}
                      />
                      <AccordionDisplay
                        last
                        title={t("weapon_stats")}
                        subChildren={battlesStats.weapons.map((weapon, i, weapons) => (
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
                                  {formatWinRateAndTotal(rule.win, rule.count)}
                                </Text>
                              </Display>
                            ))}
                          >
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(
                                weapon.rules.reduce((prev, current) => prev + current.win, 0),
                                weapon.rules.reduce((prev, current) => prev + current.count, 0)
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
        </>
        <>
          {(!props.hideEmpty || coopsStats.count > 0) && (
            <VStack style={ViewStyles.mb2}>
              <Display first last={coopsStats.count === 0} title={t("salmon_run")}>
                <Text numberOfLines={1}>{coopsStats.count}</Text>
              </Display>
              {coopsStats.count > 0 && (
                <VStack>
                  <Display title={t("clear")}>
                    <Text numberOfLines={1}>{coopsStats.clear}</Text>
                  </Display>
                  <Display title={t("failure")}>
                    <Text numberOfLines={1}>{coopsStats.count - coopsStats.clear}</Text>
                  </Display>
                  <Display title={t("waves_cleared")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(coopsStats.wave, coopsStats.count - coopsStats.exempt)}
                    </Text>
                  </Display>
                  <AccordionDisplay
                    title={t("boss_salmonids_defeated")}
                    subChildren={coopsStats.bosses.map((boss) => (
                      <Display key={boss.id} level={1} title={t(boss.id)}>
                        <Text numberOfLines={1}>
                          {(() => {
                            switch (props.dimension || 0) {
                              case 0:
                                return `${boss.defeat} / ${boss.appear}`;
                              case 1:
                                return `${boss.defeatTeam} / ${boss.appear}`;
                              default:
                                throw new Error(`unexpected dimension ${props.dimension}`);
                            }
                          })()}
                        </Text>
                      </Display>
                    ))}
                  >
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(
                        coopDimension.defeat,
                        coopsStats.count - coopsStats.exempt
                      )}
                    </Text>
                  </AccordionDisplay>
                  <AccordionDisplay
                    title={t("king_salmonids_defeated")}
                    subChildren={coopsStats.kings.map((king) => (
                      <Display key={king.id} level={1} title={t(king.id)}>
                        <Text numberOfLines={1}>{`${king.defeat} / ${king.appear}`}</Text>
                      </Display>
                    ))}
                  >
                    <Text numberOfLines={1}>
                      {coopsStats.kings.reduce((prev, current) => prev + current.defeat, 0)}
                    </Text>
                  </AccordionDisplay>
                  <Display title={t("scales")}>
                    <Circle size={10} color={Color.BronzeScale} style={ViewStyles.mr1} />
                    <Text numberOfLines={1} style={ViewStyles.mr1}>
                      {coopsStats.scales.bronze}
                    </Text>
                    <Circle size={10} color={Color.SilverScale} style={ViewStyles.mr1} />
                    <Text numberOfLines={1} style={ViewStyles.mr1}>
                      {coopsStats.scales.silver}
                    </Text>
                    <Circle size={10} color={Color.GoldScale} style={ViewStyles.mr1} />
                    <Text numberOfLines={1}>{coopsStats.scales.gold}</Text>
                  </Display>
                  <Display title={t("golden_eggs_collected")}>
                    {formatTotalAndAverageGoldenEggs(
                      coopDimension.golden,
                      coopDimension.assist,
                      coopsStats.count - coopsStats.exempt
                    )}
                  </Display>
                  <Display title={t("power_eggs_collected")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(
                        coopDimension.power,
                        coopsStats.count - coopsStats.exempt
                      )}
                    </Text>
                  </Display>
                  <Display title={t("rescued")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(
                        coopDimension.rescue,
                        coopsStats.count - coopsStats.exempt
                      )}
                    </Text>
                  </Display>
                  <Display last={coopsStats.waves.length === 0} title={t("be_rescued")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(
                        coopDimension.rescued,
                        coopsStats.count - coopsStats.exempt
                      )}
                    </Text>
                  </Display>
                  {coopsStats.waves.length > 0 && (
                    <VStack>
                      <AccordionDisplay
                        title={t("wave_stats")}
                        subChildren={coopsStats.waves.map((wave) => (
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
                        subChildren={coopsStats.stages.map((stage) => (
                          <Display key={stage.id} level={1} title={t(stage.id)}>
                            <Text numberOfLines={1}>{stage.count}</Text>
                          </Display>
                        ))}
                      />
                      <AccordionDisplay
                        title={t("supplied_weapons")}
                        subChildren={coopsStats.weapons.map((weapon) => (
                          <Display key={weapon.id} level={1} title={t(weapon.id)}>
                            <Text numberOfLines={1}>{weapon.count}</Text>
                          </Display>
                        ))}
                      />
                      <AccordionDisplay
                        last
                        title={t("supplied_special_weapons")}
                        subChildren={coopsStats.specialWeapons.map(
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
        </>
      </SalmonRunSwitcher>
      <VStack center style={!!props.footer && ViewStyles.mb2}>
        <Marquee>{t("stats_notice")}</Marquee>
      </VStack>
      {props.footer}
    </Modal>
  );
};

interface StatsViewProps {
  disabled?: boolean;
  onStats: () => Promise<Stats[]>;
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
  const [stats, setStats] = useState<Stats[]>();
  const [loading, setLoading] = useState(false);
  const [displayStats, setDisplayStats] = useState(false);
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
    if (!stats) {
      return undefined;
    }
    return stats.filter((result) => {
      if (beginTime === 0) {
        return true;
      }
      if (result.battle) {
        return result.battle.time >= beginTime;
      }
      return result.coop!.time >= beginTime;
    });
  }, [stats, beginTime]);

  const onStatsPress = async () => {
    setLoading(true);
    const results = await props.onStats();
    setStats(results);
    setDisplayStats(true);
    setLoading(false);
  };
  const onStatsClose = () => {
    setDisplayStats(false);
  };
  const onModalHide = () => {
    setStats(undefined);
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
        stats={filtered}
        isVisible={displayStats}
        footer={<Notice title={t("stats_notice2")} />}
        onClose={onStatsClose}
        onModalHide={onModalHide}
      >
        <SegmentedControl
          values={[t("all"), t("day"), t("week"), t("month"), t("season")]}
          selectedIndex={group}
          onChange={onGroupChange}
          style={ViewStyles.mb2}
        />
      </StatsModal>
    </Center>
  );
};

export { StatsModal };
export default StatsView;
