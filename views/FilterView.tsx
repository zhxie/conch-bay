import { useState } from "react";
import { ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Button,
  Center,
  Color,
  FilterButton,
  HStack,
  IconButton,
  Marquee,
  Modal,
  TextStyles,
  VStack,
  ViewStyles,
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
  const colorScheme = useColorScheme();
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

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
      <HStack>
        <Center style={[ViewStyles.pl4, ViewStyles.pr2, ViewStyles.sepr]}>
          <IconButton
            isDisabled={props.isDisabled}
            size={32}
            color={
              props.filter && !isFilterEqual(props.filter, EmptyFilterProps)
                ? Color.AccentColor
                : undefined
            }
            icon="filter"
            style={{ paddingTop: 2 }}
            onPress={onFilterPress}
          />
        </Center>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack flex center style={[ViewStyles.pl2, ViewStyles.pr4]}>
            <FilterButton
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
            <FilterButton
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
            <FilterButton
              isDisabled={props.isDisabled}
              color={isFilterEqual(props.filter, XBattleFilterProps) ? Color.XBattle : undefined}
              title={t("x_battle")}
              style={ViewStyles.mr2}
              onPress={() => {
                onQuickFilterPress(XBattleFilterProps);
              }}
            />
            <FilterButton
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
            <FilterButton
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
          <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("modes")}</Marquee>
          <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
            {props.options?.modes.map((mode) => (
              <FilterButton
                key={mode}
                isDisabled={props.isDisabled}
                color={props.filter?.modes.includes(mode) ? Color.AccentColor : undefined}
                textColor={Color.DarkText}
                title={t(mode)}
                style={[ViewStyles.mr2, ViewStyles.mb2]}
                onPress={() => {
                  onOptionPress("modes", mode);
                }}
              />
            ))}
          </HStack>
          <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("rules")}</Marquee>
          <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
            {props.options?.rules.map((rule) => (
              <FilterButton
                key={rule}
                isDisabled={props.isDisabled}
                color={props.filter?.rules.includes(rule) ? Color.AccentColor : undefined}
                textColor={Color.DarkText}
                title={t(rule)}
                style={[ViewStyles.mr2, ViewStyles.mb2]}
                onPress={() => {
                  onOptionPress("rules", rule);
                }}
              />
            ))}
          </HStack>
          <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("stages")}</Marquee>
          <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
            {props.options?.stages.map((stage) => (
              <FilterButton
                key={stage}
                isDisabled={props.isDisabled}
                color={props.filter?.stages.includes(stage) ? Color.AccentColor : undefined}
                textColor={Color.DarkText}
                title={t(stage)}
                style={[ViewStyles.mr2, ViewStyles.mb2]}
                onPress={() => {
                  onOptionPress("stages", stage);
                }}
              />
            ))}
          </HStack>
          <Marquee style={[TextStyles.h2, ViewStyles.mb2]}>{t("weapons")}</Marquee>
          <HStack style={[ViewStyles.mb2, { flexWrap: "wrap" }]}>
            {props.options?.weapons.map((weapon) => (
              <FilterButton
                key={weapon}
                isDisabled={props.isDisabled}
                color={props.filter?.weapons.includes(weapon) ? Color.AccentColor : undefined}
                textColor={Color.DarkText}
                title={t(weapon)}
                style={[ViewStyles.mr2, ViewStyles.mb2]}
                onPress={() => {
                  onOptionPress("weapons", weapon);
                }}
              />
            ))}
          </HStack>
          <VStack style={[ViewStyles.wf, ViewStyles.pr2]}>
            <Button
              isDisabled={props.isDisabled}
              style={ViewStyles.accent}
              onPress={onClearFilterPress}
            >
              <Marquee style={reverseTextColor}>{t("clear_filter")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default FilterView;
