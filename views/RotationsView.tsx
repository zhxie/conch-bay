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
import { Brief, canGroupBattle, canGroupCoop } from "../utils/stats";
import { getCoopRuleColor, getImageCacheSource, getVsModeColor } from "../utils/ui";
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
  const onGroupDismiss = () => {
    setDisplayGroup(false);
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
            time={formatGroupPeriod(
              result.item[result.item.length - 1].battle!.time,
              result.item[0].battle!.time
            )}
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
    return (
      <VStack style={ViewStyles.px4}>
        <CoopRotationButton
          group={result.item}
          color={getCoopRuleColor(result.item[0].coop!.rule)!}
          first={result.index === 0}
          last={result.index === groups.length - 1}
          rule={t(result.item[0].coop!.rule)}
          time={formatGroupPeriod(
            result.item[result.item.length - 1].coop!.time,
            result.item[0].coop!.time
          )}
          stage={[...stageMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map((stages) => t(stages[0]))
            .join(" / ")}
          weapons={result.item[0].coop!.suppliedWeapons.map((weapon) => {
            if (unknownList.images[weapon]) {
              return getImageCacheSource(
                `https://splatoon3.ink/assets/splatnet/v2/ui_img/${weapon}_0.png`
              );
            }
            return getImageCacheSource(
              `https://splatoon3.ink/assets/splatnet/v2/weapon_illust/${weapon}_0.png`
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
        data={groups}
        keyExtractor={(group) =>
          group[0].battle ? group[0].battle.time.toString() : group[0].coop!.time.toString()
        }
        renderItem={renderItem}
        estimatedItemSize={64}
        estimatedHeight={64 * groups.length}
        ListHeaderComponent={
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
        }
        onDismiss={onRotationDismiss}
      />
    </Center>
  );
};

export default RotationsView;
