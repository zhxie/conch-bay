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
import { BattleBrief, Brief, CoopBrief } from "../utils/stats";
import { getCoopRuleColor, getImageCacheSource, getVsModeColor } from "../utils/ui";
import { StatsModal } from "./StatsView";

interface StatsGroup {
  battles?: BattleBrief[];
  coops?: CoopBrief[];
}

interface RotationViewProps {
  disabled?: boolean;
  onBriefs: () => Promise<Brief[]>;
  style?: StyleProp<ViewStyle>;
}

const RotationsView = (props: RotationViewProps) => {
  const [briefs, setBriefs] = useState<Brief[]>();
  const [loading, setLoading] = useState(false);
  const [rotations, setRotations] = useState(false);
  const [group, setGroup] = useState<Brief[]>();
  const [displayGroup, setDisplayGroup] = useState(false);
  const [dimension, setDimension] = useState(0);

  const canGroup = (current: Brief, group: StatsGroup) => {
    // TODO: reuse group codes.
    if (current.battle && group.battles) {
      const mode = current.battle.mode;
      if (mode === group.battles[0].mode) {
        switch (mode) {
          case "VnNNb2RlLTE=":
          case "VnNNb2RlLTY=":
          case "VnNNb2RlLTc=":
            if (
              Math.floor(current.battle.time / 7200000) ===
              Math.floor(group.battles[0].time / 7200000)
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTI=":
          case "VnNNb2RlLTUx":
          case "VnNNb2RlLTM=":
          case "VnNNb2RlLTQ=":
            if (
              Math.floor(current.battle.time / 7200000) ===
                Math.floor(group.battles[0].time / 7200000) ||
              (current.battle.rule === group.battles[0].rule &&
                Math.floor(current.battle.time / 7200000) ===
                  Math.floor((group.battles[0].time - 2 * 60 * 1000) / 7200000))
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTg=":
            if (
              Math.floor(current.battle.time / 86400000) ===
                Math.floor(group.battles[0].time / 86400000) ||
              Math.floor(current.battle.time / 86400000) ===
                Math.floor((group.battles[0].time - 2 * 60 * 1000) / 86400000)
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTU=":
          default:
            return true;
        }
      }
    }
    if (current.coop && group.coops) {
      if (
        current.coop.rule === group.coops[0].rule &&
        current.coop.stage === group.coops[0].stage &&
        current.coop.suppliedWeapons.join() === group.coops[0].suppliedWeapons.join() &&
        (Math.ceil(current.coop.time / 7200000) - Math.floor(group.coops[0].time / 7200000) <= 24 ||
          Math.ceil(current.coop.time / 7200000) -
            Math.floor((group.coops[0].time - 2 * 60 * 1000) / 7200000) <=
            24)
      ) {
        return true;
      }
    }
    return false;
  };

  const groups = useMemo(() => {
    const groups: StatsGroup[] = [];
    if (!briefs) {
      return groups;
    }
    let group: StatsGroup = {};
    for (const stat of briefs) {
      if (canGroup(stat, group)) {
        if (stat.battle) {
          group.battles!.push(stat.battle);
        } else {
          group.coops!.push(stat.coop!);
        }
      } else {
        if (group.battles || group.coops) {
          groups.push(group);
        }
        if (stat.battle) {
          group = { battles: [stat.battle] };
        } else {
          group = { coops: [stat.coop!] };
        }
      }
    }
    if (group.battles || group.coops) {
      groups.push(group);
    }
    return groups;
  }, [briefs]);

  const onRotationPress = async () => {
    setLoading(true);
    const results = await props.onBriefs();
    setBriefs(results);
    setRotations(true);
    setLoading(false);
  };
  const onRotationClose = () => {
    setRotations(false);
  };
  const onModalHide = () => {
    setBriefs(undefined);
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
  const onGroupClose = () => {
    setDisplayGroup(false);
  };
  const onDimensionChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setDimension(event.nativeEvent.selectedSegmentIndex);
  };

  const onPress = useCallback((group: StatsGroup) => {
    if (group.battles) {
      setGroup(group.battles.map((battle) => ({ battle })));
    } else {
      setGroup(group.coops!.map((coop) => ({ coop })));
    }
    setDisplayGroup(true);
  }, []);

  const renderItem = (result: ListRenderItemInfo<StatsGroup>) => {
    if (result.item.battles) {
      const stageMap = new Map<string, number>();
      for (const battle of result.item.battles) {
        if (!stageMap.has(battle.stage)) {
          stageMap.set(battle.stage, 0);
        }
        stageMap.set(battle.stage, stageMap.get(battle.stage)! + 1);
      }
      return (
        <VStack style={ViewStyles.px4}>
          <BattleRotationButton
            stats={result.item}
            color={getVsModeColor(result.item.battles[0].mode)!}
            first={result.index === 0}
            last={result.index === groups.length - 1}
            rule={t(result.item.battles[0].rule)}
            time={formatGroupPeriod(
              result.item.battles[result.item.battles.length - 1].time,
              result.item.battles[0].time
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
    return (
      <VStack style={ViewStyles.px4}>
        <CoopRotationButton
          stats={result.item}
          color={getCoopRuleColor(result.item.coops![0].rule)!}
          first={result.index === 0}
          last={result.index === groups.length - 1}
          rule={t(result.item.coops![0].rule)}
          time={formatGroupPeriod(
            result.item.coops![result.item.coops!.length - 1].time,
            result.item.coops![0].time
          )}
          stage={t(result.item.coops![0].stage)}
          weapons={result.item.coops![0].suppliedWeapons.map((weapon) => {
            // TODO: use v1 assets until both random and golden random weapon icon are cached in Splatoon3.ink.
            if (unknownList.images[weapon]) {
              return getImageCacheSource(
                `https://splatoon3.ink/assets/splatnet/v1/ui_img/${weapon}_0.png`
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
        loading={loading}
        icon="calendar"
        title={t("rotations")}
        onPress={onRotationPress}
      />
      <FlashModal
        isVisible={rotations}
        data={groups}
        keyExtractor={(group) =>
          group.battles ? group.battles[0].time.toString() : group.coops![0].time.toString()
        }
        renderItem={renderItem}
        estimatedItemSize={64}
        ListHeaderComponent={
          <StatsModal
            briefs={group}
            dimension={dimension}
            hideEmpty
            isVisible={displayGroup}
            onClose={onGroupClose}
          >
            <SegmentedControl
              values={[t("self"), t("team")]}
              selectedIndex={dimension}
              onChange={onDimensionChange}
              style={ViewStyles.mb2}
            />
          </StatsModal>
        }
        onClose={onRotationClose}
        onModalHide={onModalHide}
        // HACK: fixed height should be provided to FlashList.
        style={[ViewStyles.modal2d, { height: 32 + 64 * groups.length, paddingHorizontal: 0 }]}
      />
    </Center>
  );
};

export default RotationsView;
