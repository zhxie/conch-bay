import { useState } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
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
  TextStyles,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import { FilterProps } from "../utils/database";

interface FilterViewProps {
  isDisabled: boolean;
  filter?: FilterProps;
  options?: FilterProps;
  onChange: (filter?: FilterProps) => void;
  style?: StyleProp<ViewStyle>;
}

const EmptyFilterProps = {
  modes: [],
  rules: [],
  stages: [],
  weapons: [],
};
const RegularBattleFilterProps = {
  modes: ["VnNNb2RlLTE=", "VnNNb2RlLTY=", "VnNNb2RlLTc=", "VnNNb2RlLTg="],
  rules: [],
  stages: [],
  weapons: [],
};
const AnarchyBattleFilterProps = {
  modes: ["VnNNb2RlLTI=", "VnNNb2RlLTUx"],
  rules: [],
  stages: [],
  weapons: [],
};
const XBattleFilterProps = {
  modes: ["VnNNb2RlLTM="],
  rules: [],
  stages: [],
  weapons: [],
};
const ChallengeFilterProps = {
  modes: ["VnNNb2RlLTQ="],
  rules: [],
  stages: [],
  weapons: [],
};
const PrivateBattleFilterProps = {
  modes: ["VnNNb2RlLTU="],
  rules: [],
  stages: [],
  weapons: [],
};
const SalmonRunFilterProps = {
  modes: ["salmon_run"],
  rules: [],
  stages: [],
  weapons: [],
};

const FilterView = (props: FilterViewProps) => {
  const theme = useTheme();

  const [filter, setFilter] = useState(false);

  const isFilterEqual = (a?: FilterProps, b?: FilterProps) => {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    for (const group of ["modes", "rules", "stages", "weapons"]) {
      if (a[group].length !== b[group].length) {
        return false;
      }
      for (const item of a[group]) {
        if (!b[group].includes(item)) {
          return false;
        }
      }
    }
    return true;
  };

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
  const onFilterClose = () => {
    setFilter(false);
  };
  const onOptionPress = (group: string, key: string) => {
    if (!props.filter) {
      const filter = { modes: [], rules: [], stages: [], weapons: [] };
      filter[group].push(key);
      props.onChange(filter);
    } else {
      if (props.filter[group].includes(key)) {
        const newFilter = JSON.parse(JSON.stringify(props.filter));
        newFilter[group] = newFilter[group].filter((item: string) => item !== key);
        props.onChange(newFilter);
      } else {
        const newFilter = JSON.parse(JSON.stringify(props.filter));
        newFilter[group].push(key);
        props.onChange(newFilter);
      }
    }
  };
  const onClearFilterPress = () => {
    props.onChange(undefined);
  };

  return (
    <VStack style={[ViewStyles.wf, props.style]}>
      <HStack center>
        <Center style={[ViewStyles.pl4, ViewStyles.pr2, ViewStyles.sepr]}>
          <IconButton
            isDisabled={props.isDisabled}
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
          <HStack flex center style={[ViewStyles.pl2, ViewStyles.pr4]}>
            <ColorFilterButton
              isDisabled={props.isDisabled}
              color={
                isFilterEqual(props.filter, RegularBattleFilterProps)
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
              isDisabled={props.isDisabled}
              color={
                isFilterEqual(props.filter, AnarchyBattleFilterProps)
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
              isDisabled={props.isDisabled}
              color={isFilterEqual(props.filter, XBattleFilterProps) ? Color.XBattle : undefined}
              title={t("x_battle")}
              style={ViewStyles.mr2}
              onPress={() => {
                onQuickFilterPress(XBattleFilterProps);
              }}
            />
            <ColorFilterButton
              isDisabled={props.isDisabled}
              color={
                isFilterEqual(props.filter, ChallengeFilterProps) ? Color.Challenge : undefined
              }
              title={t("challenge_b")}
              style={ViewStyles.mr2}
              onPress={() => {
                onQuickFilterPress(ChallengeFilterProps);
              }}
            />
            <ColorFilterButton
              isDisabled={props.isDisabled}
              color={
                isFilterEqual(props.filter, PrivateBattleFilterProps)
                  ? Color.PrivateBattle
                  : undefined
              }
              title={t("private_battle")}
              style={ViewStyles.mr2}
              onPress={() => {
                onQuickFilterPress(PrivateBattleFilterProps);
              }}
            />
            <ColorFilterButton
              isDisabled={props.isDisabled}
              color={
                isFilterEqual(props.filter, SalmonRunFilterProps) ? Color.SalmonRun : undefined
              }
              title={t("salmon_run")}
              onPress={() => {
                onQuickFilterPress(SalmonRunFilterProps);
              }}
            />
          </HStack>
        </ScrollView>
      </HStack>
      <Modal
        isVisible={filter}
        onClose={onFilterClose}
        style={[ViewStyles.modal2d, ViewStyles.pl4, ViewStyles.pr2]}
      >
        <VStack flex>
          {(props.options?.modes.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("modes")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options?.modes.map((mode) => (
                  <FilterButton
                    key={mode}
                    isDisabled={props.isDisabled}
                    textColor={props.filter?.modes.includes(mode) ? Color.DarkText : undefined}
                    title={t(mode)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.modes.includes(mode) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("modes", mode);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.rules.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("rules")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options?.rules.map((rule) => (
                  <FilterButton
                    key={rule}
                    isDisabled={props.isDisabled}
                    textColor={props.filter?.rules.includes(rule) ? Color.DarkText : undefined}
                    title={t(rule)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.rules.includes(rule) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("rules", rule);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.stages.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("stages")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options?.stages.map((stage) => (
                  <FilterButton
                    key={stage}
                    isDisabled={props.isDisabled}
                    textColor={props.filter?.stages.includes(stage) ? Color.DarkText : undefined}
                    title={t(stage)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.stages.includes(stage) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("stages", stage);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          {(props.options?.weapons.length ?? 0) > 0 && (
            <VStack flex>
              <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("weapons")}</Marquee>
              <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
                {props.options?.weapons.map((weapon) => (
                  <FilterButton
                    key={weapon}
                    isDisabled={props.isDisabled}
                    textColor={props.filter?.weapons.includes(weapon) ? Color.DarkText : undefined}
                    title={t(weapon)}
                    style={[
                      ViewStyles.mr2,
                      ViewStyles.mb2,
                      props.filter?.weapons.includes(weapon) && ViewStyles.accent,
                    ]}
                    onPress={() => {
                      onOptionPress("weapons", weapon);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          )}
          <VStack style={[ViewStyles.wf, ViewStyles.pr2]}>
            <Button
              isDisabled={props.isDisabled}
              style={ViewStyles.accent}
              onPress={onClearFilterPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("clear_filter")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default FilterView;
