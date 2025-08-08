import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import { ListRenderItemInfo } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import {
  BattleRotationButton,
  Center,
  CoopRotationButton,
  FlashModal,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import unknownList from "../models/unknowns.json";
import { BattleBrief, Brief, canGroupBattle, canGroupCoop, CoopBrief } from "../utils/stats";
import { getCoopRuleColor, getImageCacheSource, getVsModeColor, roundPower } from "../utils/ui";
import { StatsModal } from "./StatsView";

interface RotationViewProps {
  disabled?: boolean;
  briefs?: Brief[];
  style?: StyleProp<ViewStyle>;
}

const RotationsView = (props: RotationViewProps) => {
  const [rotations, setRotations] = useState(false);
  const [group, setGroup] = useState<Brief[]>();
  const [displayGroup, setDisplayGroup] = useState(false);
  const [dimension, setDimension] = useState(0);
  const [index, setIndex] = useState(0);

  const groups = useMemo(() => {
    const groups: Brief[][] = [];
    if (!props.briefs) {
      return groups;
    }
    for (const brief of props.briefs) {
      if (brief.battle) {
        if (groups.length === 0 || !canGroupBattle(brief.battle, groups[groups.length - 1])) {
          groups.push([brief]);
        } else {
          groups[groups.length - 1].push(brief);
        }
      } else {
        if (groups.length === 0 || !canGroupCoop(brief.coop!, groups[groups.length - 1])) {
          groups.push([brief]);
        } else {
          groups[groups.length - 1].push(brief);
        }
      }
    }
    return groups;
  }, [props.briefs]);

  const onRotationPress = () => {
    setRotations(true);
  };
  const onRotationDismiss = () => {
    setRotations(false);
  };
  const formatGroupPeriod = (start: number, end: number) => {
    const dateTimeFormat = "M/D HH:mm";

    const startTime = dayjs(start).format(dateTimeFormat);
    const endTime = dayjs(end).format(dateTimeFormat);
    const startTimeComponents = startTime.split(" ");
    const endTimeComponents = endTime.split(" ");
    // Same day.
    if (startTimeComponents[0] === endTimeComponents[0]) {
      if (startTimeComponents[1] === endTimeComponents[1]) {
        return startTime;
      }
      return `${startTime} – ${endTimeComponents[1]}`;
    }
    // Different day.
    if (endTimeComponents[1] === "00:00") {
      const prevDate = dayjs(endTime).subtract(1, "day").format(dateTimeFormat);
      const prevDateComponents = prevDate.split(" ");
      if (prevDateComponents[0] === startTimeComponents[0]) {
        return `${startTime} – 24:00`;
      }
    }
    return `${startTime} – ${endTime}`;
  };
  const formatPower = (briefs: BattleBrief[]) => {
    const lastPower = briefs[0].power;
    const maxPower = Math.max(
      ...briefs
        .map((brief) => brief.power)
        .filter((power) => power)
        .map((power) => power!),
    );
    if (lastPower) {
      return `${roundPower(lastPower)} / ${roundPower(maxPower)}`;
    }
    return "";
  };
  const formatJobGrade = (briefs: CoopBrief[]) => {
    if (briefs[0].grade) {
      return `${t(briefs[0].grade.id)} ${briefs[0].grade.point}`;
    }
    return "";
  };
  const onGroupDismiss = () => {
    setDisplayGroup(false);
  };
  const onIndexChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setIndex(event.nativeEvent.selectedSegmentIndex);
  };
  const onDimensionChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setDimension(event.nativeEvent.selectedSegmentIndex);
  };

  const onPress = useCallback((group: Brief[]) => {
    setGroup(group);
    setDisplayGroup(true);
  }, []);

  const renderItem = (result: ListRenderItemInfo<Brief[]>) => {
    if (result.item[0].battle) {
      const stageMap = new Map<string, number>();
      for (const brief of result.item) {
        if (!stageMap.has(brief.battle!.stage)) {
          stageMap.set(brief.battle!.stage, 0);
        }
        stageMap.set(brief.battle!.stage, stageMap.get(brief.battle!.stage)! + 1);
      }
      return (
        <VStack style={ViewStyles.px4}>
          <BattleRotationButton
            group={result.item}
            color={getVsModeColor(result.item[0].battle!.mode)!}
            first={result.index === 0}
            last={result.index === groups.length - 1}
            rule={t(result.item[0].battle.rule)}
            info={
              index === 0
                ? formatGroupPeriod(
                    result.item[result.item.length - 1].battle!.time,
                    result.item[0].battle!.time,
                  )
                : formatPower(result.item.map((item) => item.battle) as BattleBrief[])
            }
            subtle={index === 0}
            stages={[...stageMap.entries()]
              .sort((a, b) => b[1] - a[1])
              .map((stages) => t(stages[0]))
              .join(" / ")}
            onPress={onPress}
          />
        </VStack>
      );
    }
    const stageMap = new Map<string, number>();
    for (const brief of result.item) {
      if (!stageMap.has(brief.coop!.stage)) {
        stageMap.set(brief.coop!.stage, 0);
      }
      stageMap.set(brief.coop!.stage, stageMap.get(brief.coop!.stage)! + 1);
    }
    let maxGradeId = "",
      maxGradePoint = 0;
    for (const grade of result.item.map((item) => item.coop?.grade).filter((grade) => grade)) {
      if (grade!.id > maxGradeId) {
        maxGradeId = grade!.id;
        maxGradePoint = grade!.point;
      } else if (grade!.id === maxGradeId) {
        maxGradePoint = Math.max(maxGradePoint, grade!.point);
      }
    }
    return (
      <VStack style={ViewStyles.px4}>
        <CoopRotationButton
          group={result.item}
          color={getCoopRuleColor(result.item[0].coop!.rule)!}
          first={result.index === 0}
          last={result.index === groups.length - 1}
          rule={t(result.item[0].coop!.rule)}
          info={
            index === 0
              ? formatGroupPeriod(
                  result.item[result.item.length - 1].coop!.time,
                  result.item[0].coop!.time,
                )
              : formatJobGrade(result.item.map((item) => item.coop) as CoopBrief[])
          }
          subtle={index === 0}
          stage={[...stageMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map((stages) => t(stages[0]))
            .join(" / ")}
          weapons={result.item[0].coop!.suppliedWeapons.map((weapon) => {
            if (unknownList.images[weapon]) {
              return getImageCacheSource(
                `https://splatoon3.ink/assets/splatnet/v2/ui_img/${weapon}_0.png`,
              );
            }
            return getImageCacheSource(
              `https://splatoon3.ink/assets/splatnet/v2/weapon_illust/${weapon}_0.png`,
            );
          })}
          onPress={onPress}
        />
      </VStack>
    );
  };

  return (
    <Center style={props.style}>
      <ToolButton
        disabled={props.disabled}
        icon="calendar"
        title={t("rotations")}
        onPress={onRotationPress}
      />
      <FlashModal
        isVisible={rotations}
        size="medium"
        noPadding
        allowDismiss
        data={groups}
        keyExtractor={(group) =>
          group[0].battle ? group[0].battle.time.toString() : group[0].coop!.time.toString()
        }
        renderItem={renderItem}
        estimatedItemSize={64}
        estimatedHeight={64 * groups.length}
        extraData={index}
        ListHeaderComponent={
          <VStack style={ViewStyles.px4}>
            <SegmentedControl
              values={[t("played_time"), t("power")]}
              selectedIndex={index}
              onChange={onIndexChange}
              style={ViewStyles.mb2}
            />
          </VStack>
        }
        onDismiss={onRotationDismiss}
      />
      <StatsModal
        briefs={group}
        dimension={dimension}
        hideEmpty
        isVisible={displayGroup}
        onDismiss={onGroupDismiss}
      >
        <SegmentedControl
          values={[t("self"), t("team")]}
          selectedIndex={dimension}
          onChange={onDimensionChange}
          style={ViewStyles.mb1}
        />
      </StatsModal>
    </Center>
  );
};

export default RotationsView;
