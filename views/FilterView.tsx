import React, { useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleProp, ViewStyle } from "react-native";
import {
  Button,
  Center,
  Color,
  ColorFilterButton,
  FilterButton,
  HStack,
  IconButton,
  Marquee,
  Modal,
  Notice,
  SalmonRunSwitcher,
  TextStyles,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import coopStageList from "../models/coopStages.json";
import { deepCopy } from "../utils/codec";
import { FilterProps, isFilterEqual, isFilterInclude } from "../utils/database";

interface FilterViewProps {
  disabled?: boolean;
  filter?: FilterProps;
  players?: Record<string, string>;
  options?: FilterProps;
  onChange: (filter?: FilterProps) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const EmptyFilterProps = {};
const RegularBattleFilterProps = {
  modes: ["VnNNb2RlLTE=", "VnNNb2RlLTY=", "VnNNb2RlLTc=", "VnNNb2RlLTg="],
};
const AnarchyBattleFilterProps = {
  modes: ["VnNNb2RlLTI=", "VnNNb2RlLTUx"],
};
const XBattleFilterProps = {
  modes: ["VnNNb2RlLTM="],
};
const ChallengeFilterProps = {
  modes: ["VnNNb2RlLTQ="],
};
const PrivateBattleFilterProps = {
  modes: ["VnNNb2RlLTU="],
};
const SalmonRunFilterProps = {
  modes: ["salmon_run"],
};

const FilterView = (props: FilterViewProps) => {
  const theme = useTheme();

  const [filter, setFilter] = useState(false);

  const onFilterPress = () => {
    setFilter(true);
  };
  const onFilterLongPress = () => {
    if (!isFilterEqual(props.filter, EmptyFilterProps)) {
      props.onChange(EmptyFilterProps);
    }
  };
  const onQuickFilterPress = (filter: FilterProps) => {
    if (!isFilterEqual(props.filter, filter)) {
      props.onChange(filter);
    } else {
      props.onChange(undefined);
    }
  };
  const onFilterDismiss = () => {
    setFilter(false);
  };
  const onOptionPress = (group: string, key: string) => {
    if (!props.filter) {
      const filter = { players: [], modes: [], rules: [], stages: [], weapons: [] };
      filter[group].push(key);
      props.onChange(filter);
    } else {
      if (!props.filter[group]) {
        props.filter[group] = [];
      }
      if (props.filter[group].includes(key)) {
        const newFilter = deepCopy(props.filter);
        newFilter[group] = newFilter[group].filter((item: string) => item !== key);
        props.onChange(newFilter);
      } else {
        const newFilter = deepCopy(props.filter);
        newFilter[group].push(key);
        props.onChange(newFilter);
      }
    }
  };
  const onClearFilterPress = () => {
    props.onChange(undefined);
  };

  return (
    <VStack style={[ViewStyles.wf, props.style]} onLayout={props.onLayout}>
      <HStack center>
        <Center style={[ViewStyles.pl4, ViewStyles.pr2, ViewStyles.sepr]}>
          <IconButton
            disabled={props.disabled}
            // HACK: the default height of filter button is iOS is 33px.
            size={33}
            color={
              props.filter && !isFilterEqual(props.filter, EmptyFilterProps)
                ? Color.AccentColor
                : undefined
            }
            icon="filter"
            style={{ paddingTop: 2 }}
            onPress={onFilterPress}
            onLongPress={onFilterLongPress}
          />
        </Center>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* HACK: withdraw 8px margin in the last filter button. */}
          <HStack
            flex
            center
            style={[ViewStyles.pl2, ViewStyles.pr4, { marginRight: -ViewStyles.mr2.marginRight }]}
          >
            <SalmonRunSwitcher>
              <>
                <ColorFilterButton
                  disabled={props.disabled}
                  color={
                    isFilterInclude(props.filter, RegularBattleFilterProps)
                      ? Color.RegularBattle
                      : undefined
                  }
                  title={t("regular_battle")}
                  style={ViewStyles.mr2}
                  onPress={() => {
                    onQuickFilterPress(RegularBattleFilterProps);
                  }}
                />
                <ColorFilterButton
                  disabled={props.disabled}
                  color={
                    isFilterInclude(props.filter, AnarchyBattleFilterProps)
                      ? Color.AnarchyBattle
                      : undefined
                  }
                  title={t("anarchy_battle")}
                  style={ViewStyles.mr2}
                  onPress={() => {
                    onQuickFilterPress(AnarchyBattleFilterProps);
                  }}
                />
                <ColorFilterButton
                  disabled={props.disabled}
                  color={
                    isFilterInclude(props.filter, XBattleFilterProps) ? Color.XBattle : undefined
                  }
                  title={t("x_battle")}
                  style={ViewStyles.mr2}
                  onPress={() => {
                    onQuickFilterPress(XBattleFilterProps);
                  }}
                />
                <ColorFilterButton
                  disabled={props.disabled}
                  color={
                    isFilterInclude(props.filter, ChallengeFilterProps)
                      ? Color.Challenge
                      : undefined
                  }
                  title={t("challenge_b")}
                  style={ViewStyles.mr2}
                  onPress={() => {
                    onQuickFilterPress(ChallengeFilterProps);
                  }}
                />
                <ColorFilterButton
                  disabled={props.disabled}
                  color={
                    isFilterInclude(props.filter, PrivateBattleFilterProps)
                      ? Color.PrivateBattle
                      : undefined
                  }
                  title={t("private_battle")}
                  style={ViewStyles.mr2}
                  onPress={() => {
                    onQuickFilterPress(PrivateBattleFilterProps);
                  }}
                />
              </>
              <ColorFilterButton
                disabled={props.disabled}
                color={
                  isFilterInclude(props.filter, SalmonRunFilterProps) ? Color.SalmonRun : undefined
                }
                title={t("salmon_run")}
                style={ViewStyles.mr2}
                onPress={() => {
                  onQuickFilterPress(SalmonRunFilterProps);
                }}
              />
            </SalmonRunSwitcher>
          </HStack>
        </ScrollView>
      </HStack>
      <Modal
        isVisible={filter}
        size="medium"
        onDismiss={onFilterDismiss}
        style={[ViewStyles.pl4, ViewStyles.pr2]}
      >
        <VStack flex>
          {(props.filter?.players?.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("players")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.filter!.players!.map((player) => (
                  <FilterButton
                    key={player}
                    disabled={props.disabled}
                    textColor={Color.DarkText}
                    title={props.players?.[player] ?? player}
                    style={[ViewStyles.mr2, ViewStyles.mb2, ViewStyles.accent]}
                    onPress={() => {
                      onOptionPress("players", player);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.modes?.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("modes")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options!.modes!.map((mode) => (
                  <FilterButton
                    key={mode}
                    disabled={props.disabled}
                    textColor={props.filter?.modes?.includes(mode) ? Color.DarkText : undefined}
                    title={t(mode)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.modes?.includes(mode) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("modes", mode);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.rules?.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("rules")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options!.rules!.map((rule) => (
                  <FilterButton
                    key={rule}
                    disabled={props.disabled}
                    textColor={props.filter?.rules?.includes(rule) ? Color.DarkText : undefined}
                    title={t(rule)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.rules?.includes(rule) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("rules", rule);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.stages?.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("stages")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options!.stages!.map((stage) => (
                  <FilterButton
                    key={stage}
                    disabled={props.disabled}
                    textColor={props.filter?.stages?.includes(stage) ? Color.DarkText : undefined}
                    title={
                      coopStageList.bigRunStages[stage] ? `${t(stage)} (${t("big_run")})` : t(stage)
                    }
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.stages?.includes(stage) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("stages", stage);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.weapons?.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("weapons")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options!.weapons!.map((weapon) => (
                  <FilterButton
                    key={weapon}
                    disabled={props.disabled}
                    textColor={props.filter?.weapons?.includes(weapon) ? Color.DarkText : undefined}
                    title={t(weapon)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.weapons?.includes(weapon) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("weapons", weapon);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          <VStack style={[ViewStyles.wf, ViewStyles.mb2, ViewStyles.pr2]}>
            <Button
              disabled={props.disabled}
              style={ViewStyles.accent}
              onPress={onClearFilterPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("clear_filter")}</Marquee>
            </Button>
          </VStack>
          <VStack style={ViewStyles.wf}>
            <Notice title={t("filter_notice")} />
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default FilterView;
