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
import { deepCopy } from "../utils/codec";
import { BattleBrief, Brief, CoopBrief, getBattleStats, getCoopStats } from "../utils/stats";
import { roundPower } from "../utils/ui";

const winRateSort = (a: { count: number; win: number }, b: { count: number; win: number }) => {
  if (a.count === 0 && b.count === 0) {
    return 0;
  }
  if (a.count === 0) {
    return 1;
  }
  if (b.count === 0) {
    return -1;
  }
  const aWinRate = a.win / a.count;
  const bWinRate = b.win / b.count;
  if (aWinRate == bWinRate) {
    return b.win - a.win;
  }
  return bWinRate - aWinRate;
};
const clearRateSort = (
  a: { appear: number; clear: number },
  b: { appear: number; clear: number }
) => {
  if (a.appear === 0 && b.appear === 0) {
    return 0;
  }
  if (a.appear === 0) {
    return 1;
  }
  if (b.appear === 0) {
    return -1;
  }
  const aWinRate = a.clear / a.appear;
  const bWinRate = b.clear / b.appear;
  if (aWinRate == bWinRate) {
    return b.clear - a.clear;
  }
  return bWinRate - aWinRate;
};
const defeatRateSort = (
  a: { appear: number; defeat: number },
  b: { appear: number; defeat: number }
) => {
  if (a.appear === 0 && b.appear === 0) {
    return 0;
  }
  if (a.appear === 0) {
    return 1;
  }
  if (b.appear === 0) {
    return -1;
  }
  const aWinRate = a.defeat / a.appear;
  const bWinRate = b.defeat / b.appear;
  if (aWinRate == bWinRate) {
    return b.defeat - a.defeat;
  }
  return bWinRate - aWinRate;
};

interface StatsModalProps {
  briefs?: Brief[];
  dimension?: number;
  hideEmpty?: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const StatsModal = (props: StatsModalProps) => {
  const [sort, setSort] = useState(0);

  const battleStats = useMemo(
    () =>
      getBattleStats(
        ...((props.briefs?.map((result) => result.battle).filter((battle) => battle) ??
          []) as BattleBrief[])
      ),
    [props.briefs]
  );
  const coopsStats = useMemo(
    () =>
      getCoopStats(
        ...((props.briefs?.map((result) => result.coop).filter((coop) => coop) ??
          []) as CoopBrief[])
      ),
    [props.briefs]
  );

  const battleStageStats = useMemo(() => {
    switch (sort) {
      case 0:
        return battleStats.stages;
      case 1: {
        const stages = deepCopy(battleStats.stages);
        for (const stage of stages) {
          for (const rule of stage.rules) {
            rule.weapons.sort((a, b) => b.count - a.count);
          }
          stage.rules.sort((a, b) => b.count - a.count);
        }
        stages.sort((a, b) => b.count - a.count);
        return stages;
      }
      case 2: {
        const stages = deepCopy(battleStats.stages);
        for (const stage of stages) {
          for (const rule of stage.rules) {
            rule.weapons.sort(winRateSort);
          }
          stage.rules.sort(winRateSort);
        }
        stages.sort(winRateSort);
        return stages;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [battleStats, sort]);
  const battleWeaponStats = useMemo(() => {
    switch (sort) {
      case 0:
        return battleStats.weapons;
      case 1: {
        const weapons = deepCopy(battleStats.weapons);
        for (const weapon of weapons) {
          for (const rule of weapon.rules) {
            rule.stages.sort((a, b) => b.count - a.count);
          }
          weapon.rules.sort((a, b) => b.count - a.count);
        }
        weapons.sort((a, b) => b.count - a.count);
        return weapons;
      }
      case 2: {
        const weapons = deepCopy(battleStats.weapons);
        for (const weapon of weapons) {
          for (const rule of weapon.rules) {
            rule.stages.sort(winRateSort);
          }
          weapon.rules.sort(winRateSort);
        }
        weapons.sort(winRateSort);
        return weapons;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [battleStats, sort]);
  const coopBosses = useMemo(() => {
    switch (sort) {
      case 0:
        switch (props.dimension || 0) {
          case 0:
            return coopsStats.bosses;
          case 1:
            return coopsStats.bosses.map((boss) => ({
              id: boss.id,
              appear: boss.appear,
              defeat: boss.defeatTeam,
            }));
          default:
            throw new Error(`unexpected dimension ${props.dimension}`);
        }
      case 1: {
        let bosses: { id: string; appear: number; defeat: number }[];
        switch (props.dimension || 0) {
          case 0:
            bosses = coopsStats.bosses.map((boss) => ({
              id: boss.id,
              appear: boss.appear,
              defeat: boss.defeat,
            }));
            break;
          case 1:
            bosses = coopsStats.bosses.map((boss) => ({
              id: boss.id,
              appear: boss.appear,
              defeat: boss.defeatTeam,
            }));
            break;
          default:
            throw new Error(`unexpected dimension ${props.dimension}`);
        }
        bosses.sort((a, b) => b.appear - a.appear);
        return bosses;
      }
      case 2: {
        let bosses: { id: string; appear: number; defeat: number }[];
        switch (props.dimension || 0) {
          case 0:
            bosses = coopsStats.bosses.map((boss) => ({
              id: boss.id,
              appear: boss.appear,
              defeat: boss.defeat,
            }));
            break;
          case 1:
            bosses = coopsStats.bosses.map((boss) => ({
              id: boss.id,
              appear: boss.appear,
              defeat: boss.defeatTeam,
            }));
            break;
          default:
            throw new Error(`unexpected dimension ${props.dimension}`);
        }
        bosses.sort(defeatRateSort);
        return bosses;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort, props.dimension]);
  const coopKings = useMemo(() => {
    switch (sort) {
      case 0:
        return coopsStats.kings;
      case 1: {
        const kings = deepCopy(coopsStats.kings);
        kings.sort((a, b) => b.appear - a.appear);
        return kings;
      }
      case 2: {
        const kings = deepCopy(coopsStats.kings);
        kings.sort(defeatRateSort);
        return kings;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort]);
  const coopWaveStats = useMemo(() => {
    switch (sort) {
      case 0:
        return coopsStats.waves;
      case 1: {
        const waves = deepCopy(coopsStats.waves);
        for (const wave of waves) {
          wave.levels.sort((a, b) => b.appear - a.appear);
        }
        waves.sort((a, b) => b.appear - a.appear);
        return waves;
      }
      case 2: {
        const waves = deepCopy(coopsStats.waves);
        for (const wave of waves) {
          wave.levels.sort(clearRateSort);
        }
        waves.sort(clearRateSort);
        return waves;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort]);
  const coopStageStats = useMemo(() => {
    switch (sort) {
      case 0:
        return coopsStats.stages;
      case 1: {
        const stages = deepCopy(coopsStats.stages);
        stages.sort((a, b) => b.appear - a.appear);
        return stages;
      }
      case 2: {
        const stages = deepCopy(coopsStats.stages);
        stages.sort(clearRateSort);
        return stages;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort]);
  const coopWeaponStats = useMemo(() => {
    switch (sort) {
      case 0:
        return coopsStats.weapons;
      case 1: {
        const weapons = deepCopy(coopsStats.weapons);
        weapons.sort((a, b) => b.appear - a.appear);
        return weapons;
      }
      case 2: {
        const weapons = deepCopy(coopsStats.weapons);
        weapons.sort(clearRateSort);
        return weapons;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort]);
  const coopSpecialWeaponStats = useMemo(() => {
    switch (sort) {
      case 0:
        return coopsStats.specialWeapons;
      case 1: {
        const specialWeapons = deepCopy(coopsStats.specialWeapons);
        specialWeapons.sort((a, b) => b.appear - a.appear);
        return specialWeapons;
      }
      case 2: {
        const specialWeapons = deepCopy(coopsStats.specialWeapons);
        specialWeapons.sort(clearRateSort);
        return specialWeapons;
      }
      default:
        throw new Error(`unexpected sort ${sort}`);
    }
  }, [coopsStats, sort]);

  const battleDimension = useMemo(() => {
    switch (props.dimension || 0) {
      case 0:
        return battleStats.self;
      case 1:
        return battleStats.team;
      default:
        throw new Error(`unexpected dimension ${props.dimension}`);
    }
  }, [battleStats, props.dimension]);
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

  const onSortChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setSort(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <Modal isVisible={props.isVisible} size="medium" onDismiss={props.onDismiss}>
      {props.children}
      <SegmentedControl
        values={[t("default"), t("appearance"), t("win_rate")]}
        selectedIndex={sort}
        onChange={onSortChange}
        style={ViewStyles.mb2}
      />
      <SalmonRunSwitcher>
        <>
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
                      {formatTotalAndAverage(battleDimension.turf, battleStats.duration / 60)}
                    </Text>
                  </Display>
                  <Display title={t("splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverageKillAndAssist(
                        battleDimension.kill,
                        battleDimension.assist,
                        battleStats.duration / 60
                      )}
                    </Text>
                  </Display>
                  <Display title={t("be_splatted")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(battleDimension.death, battleStats.duration / 60)}
                    </Text>
                  </Display>
                  <Display last={battleStats.stages.length === 0} title={t("special_weapon_uses")}>
                    <Text numberOfLines={1}>
                      {formatTotalAndAverage(battleDimension.special, battleStats.duration / 60)}
                    </Text>
                  </Display>
                  {battleStats.stages.length > 0 && (
                    <VStack>
                      <AccordionDisplay
                        title={t("stage_stats")}
                        subChildren={battleStageStats.map((stage) => (
                          <AccordionDisplay
                            key={stage.id}
                            level={1}
                            title={t(stage.id)}
                            subChildren={stage.rules.map((rule) => (
                              <AccordionDisplay
                                key={rule.id}
                                level={2}
                                title={t(rule.id)}
                                subChildren={rule.weapons.map((weapon) => (
                                  <Display key={weapon.id} level={3} title={t(weapon.id)}>
                                    <Text numberOfLines={1}>
                                      {formatWinRateAndTotal(weapon.win, weapon.count)}
                                    </Text>
                                  </Display>
                                ))}
                              >
                                <Text numberOfLines={1}>
                                  {formatWinRateAndTotal(rule.win, rule.count)}
                                </Text>
                              </AccordionDisplay>
                            ))}
                          >
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(stage.win, stage.count)}
                            </Text>
                          </AccordionDisplay>
                        ))}
                      />
                      <AccordionDisplay
                        last
                        title={t("weapon_stats")}
                        subChildren={battleWeaponStats.map((weapon, i, weapons) => (
                          <AccordionDisplay
                            key={weapon.id}
                            last={i === weapons.length - 1}
                            level={1}
                            title={t(weapon.id)}
                            subChildren={weapon.rules.map((rule, j, rules) => (
                              <AccordionDisplay
                                key={rule.id}
                                last={i === weapons.length - 1 && j === rules.length - 1}
                                level={2}
                                title={t(rule.id)}
                                subChildren={rule.stages.map((stage) => (
                                  <Display key={stage.id} level={3} title={t(stage.id)}>
                                    <Text numberOfLines={1}>
                                      {formatWinRateAndTotal(stage.win, stage.count)}
                                    </Text>
                                  </Display>
                                ))}
                              >
                                <Text numberOfLines={1}>
                                  {formatWinRateAndTotal(rule.win, rule.count)}
                                </Text>
                              </AccordionDisplay>
                            ))}
                          >
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(weapon.win, weapon.count)}
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
                    subChildren={coopBosses.map((boss) => (
                      <Display key={boss.id} level={1} title={t(boss.id)}>
                        <Text numberOfLines={1}>
                          {formatWinRateAndTotal(boss.defeat, boss.appear)}
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
                    subChildren={coopKings.map((king) => (
                      <Display key={king.id} level={1} title={t(king.id)}>
                        <Text numberOfLines={1}>
                          {formatWinRateAndTotal(king.defeat, king.appear)}
                        </Text>
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
                        subChildren={coopWaveStats.map((wave) => (
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
                              {formatWinRateAndTotal(wave.clear, wave.appear)}
                            </Text>
                          </AccordionDisplay>
                        ))}
                      />
                      <AccordionDisplay
                        title={t("stage_stats")}
                        subChildren={coopStageStats.map((stage) => (
                          <Display key={stage.id} level={1} title={t(stage.id)}>
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(stage.clear, stage.appear)}
                            </Text>
                          </Display>
                        ))}
                      />
                      <AccordionDisplay
                        title={t("supplied_weapons")}
                        subChildren={coopWeaponStats.map((weapon) => (
                          <Display key={weapon.id} level={1} title={t(weapon.id)}>
                            <Text numberOfLines={1}>
                              {formatWinRateAndTotal(weapon.clear, weapon.appear)}
                            </Text>
                          </Display>
                        ))}
                      />
                      <AccordionDisplay
                        last
                        title={t("supplied_special_weapons")}
                        subChildren={coopSpecialWeaponStats.map(
                          (specialWeapon, i, specialWeapons) => (
                            <Display
                              key={specialWeapon.id}
                              last={i === specialWeapons.length - 1}
                              level={1}
                              title={t(specialWeapon.id)}
                            >
                              <Text numberOfLines={1}>
                                {formatWinRateAndTotal(specialWeapon.clear, specialWeapon.appear)}
                              </Text>
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
  briefs?: Brief[];
  style?: StyleProp<ViewStyle>;
}

const StatsView = (props: StatsViewProps) => {
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
    if (!props.briefs) {
      return undefined;
    }
    return props.briefs.filter((result) => {
      if (beginTime === 0) {
        return true;
      }
      if (result.battle) {
        return result.battle.time >= beginTime;
      }
      return result.coop!.time >= beginTime;
    });
  }, [props.briefs, beginTime]);

  const onStatsPress = () => {
    setDisplayStats(true);
  };
  const onStatsDismiss = () => {
    setDisplayStats(false);
  };
  const onGroupChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setGroup(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <Center style={props.style}>
      <ToolButton
        disabled={props.disabled}
        icon="chart-no-axes-column"
        title={t("stats")}
        onPress={onStatsPress}
      />
      <StatsModal
        briefs={filtered}
        isVisible={displayStats}
        footer={<Notice title={t("stats_notice2")} />}
        onDismiss={onStatsDismiss}
      >
        <SegmentedControl
          values={[t("all"), t("day"), t("week"), t("month"), t("season")]}
          selectedIndex={group}
          onChange={onGroupChange}
          style={ViewStyles.mb1}
        />
      </StatsModal>
    </Center>
  );
};

export { StatsModal };
export default StatsView;
