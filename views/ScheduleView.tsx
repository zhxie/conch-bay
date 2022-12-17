import { useState } from "react";
import { ScrollView, StyleProp, useColorScheme, ViewStyle } from "react-native";
import {
  HStack,
  Modal,
  ScheduleBox,
  ScheduleButton,
  ScheduleList,
  ShiftBox,
  ViewStyles,
} from "../components";
import { Color, CoopWeapon, Splatfest, Schedule, Schedules, Shift, VsStage } from "../models";
import {
  getCoopStage,
  getCoopStageId,
  getCoopWeapons,
  getMatchSetting,
  getShiftSetting,
  getSplatfestStage,
  getSplatfestStageId,
  getTimeRange,
  getVsRuleId,
  getVsStageIds,
  getVsStages,
  isStarted,
} from "../utils/ui";

interface ScheduleViewProps {
  t: (f: string, params?: Record<string, any>) => string;
  schedules?: Schedules;
  style?: StyleProp<ViewStyle>;
}
interface DisplayProps {
  title: string;
  color: string;
  splatfest?: Splatfest;
  schedules?: Schedule[];
  shifts?: Shift[];
  index?: number;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;

  const [display, setDisplay] = useState<DisplayProps | undefined>(undefined);
  const [displaySplatfest, setDisplaySplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);
  const [displayShifts, setDisplayShifts] = useState(false);

  const currentSplatfest = props.schedules?.currentFest?.tricolorStage
    ? props.schedules?.currentFest
    : undefined;
  const splatfestSchedules = props.schedules?.festSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const regularSchedules = props.schedules?.regularSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const anarchySchedules = props.schedules?.bankaraSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const xSchedules = props.schedules?.xSchedules.nodes.filter((node) => getMatchSetting(node));
  const bigRunShifts = props.schedules?.coopGroupingSchedule.bigRunSchedules.nodes;
  const regularShifts = props.schedules?.coopGroupingSchedule.regularSchedules.nodes;

  const formatStage = (stage: VsStage) => {
    return {
      title: t(stage.id),
      image: stage.image.url,
    };
  };
  const formatWeapon = (weapon: CoopWeapon) => {
    return weapon.image.url;
  };

  const onCurrentSplatfestPress = () => {
    setDisplay({
      title: t("tricolor_battle"),
      color: accentColor,
      splatfest: currentSplatfest,
    });
    setDisplaySplatfest(true);
  };
  const onSplatfestSchedulePress = () => {
    setDisplay({
      title: t("splatfest_battle"),
      color: accentColor,
      schedules: splatfestSchedules,
    });
    setDisplaySchedules(true);
  };
  const onRegularSchedulePress = () => {
    setDisplay({
      title: t("regular_battle"),
      color: Color.RegularBattle,
      schedules: regularSchedules,
    });
    setDisplaySchedules(true);
  };
  const onAnarchySeriesSchedulePress = () => {
    setDisplay({
      title: t("anarchy_battle_series"),
      color: Color.AnarchyBattle,
      schedules: anarchySchedules,
      index: 0,
    });
    setDisplaySchedules(true);
  };
  const onAnarchyOpenSchedulePress = () => {
    setDisplay({
      title: t("anarchy_battle_open"),
      color: Color.AnarchyBattle,
      schedules: anarchySchedules,
      index: 1,
    });
    setDisplaySchedules(true);
  };
  const onXSchedulePress = () => {
    setDisplay({
      title: t("x_battle"),
      color: Color.XBattle,
      schedules: xSchedules,
    });
    setDisplaySchedules(true);
  };
  const onBigRunShiftPress = () => {
    setDisplay({
      title: t("big_run"),
      color: Color.BigRun,
      shifts: bigRunShifts,
    });
    setDisplayShifts(true);
  };
  const onRegularShiftPress = () => {
    setDisplay({
      title: t("salmon_run"),
      color: Color.SalmonRun,
      shifts: regularShifts,
    });
    setDisplayShifts(true);
  };
  const onDisplaySplatfestClose = () => {
    setDisplaySplatfest(false);
  };
  const onDisplaySchedulesClose = () => {
    setDisplaySchedules(false);
  };
  const onDisplayShiftsClose = () => {
    setDisplayShifts(false);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ width: "100%" }, props.style]}
    >
      <HStack style={ViewStyles.px4}>
        {!props.schedules &&
          new Array(8).fill(0).map((_, i) => {
            return (
              <ScheduleButton
                key={i}
                rule=""
                stages={[]}
                style={i !== 7 ? ViewStyles.mr2 : undefined}
              />
            );
          })}
        {currentSplatfest && (
          <ScheduleButton
            color={isStarted(currentSplatfest) ? accentColor : undefined}
            rule={t("VnNSdWxlLTU=")}
            stages={[t(getSplatfestStageId(currentSplatfest))]}
            onPress={onCurrentSplatfestPress}
            style={ViewStyles.mr2}
          />
        )}
        {splatfestSchedules?.[0] && (
          <ScheduleButton
            color={isStarted(splatfestSchedules[0]) ? accentColor : undefined}
            rule={t(getVsRuleId(splatfestSchedules[0]))}
            stages={getVsStageIds(splatfestSchedules[0]).map((schedule) => t(schedule))}
            onPress={onSplatfestSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {regularSchedules?.[0] && (
          <ScheduleButton
            color={isStarted(regularSchedules[0]) ? Color.RegularBattle : undefined}
            rule={t(getVsRuleId(regularSchedules[0]))}
            stages={getVsStageIds(regularSchedules[0]).map((schedule) => t(schedule))}
            onPress={onRegularSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={t(getVsRuleId(anarchySchedules[0], 0))}
            stages={getVsStageIds(anarchySchedules[0], 0).map((schedule) => t(schedule))}
            onPress={onAnarchySeriesSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={t(getVsRuleId(anarchySchedules[0], 1))}
            stages={getVsStageIds(anarchySchedules[0], 1).map((schedule) => t(schedule))}
            onPress={onAnarchyOpenSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {xSchedules?.[0] && (
          <ScheduleButton
            color={isStarted(xSchedules[0]) ? Color.XBattle : undefined}
            rule={t(getVsRuleId(xSchedules[0]))}
            stages={getVsStageIds(xSchedules[0]).map((schedule) => t(schedule))}
            onPress={onXSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {bigRunShifts?.[0] && (
          <ScheduleButton
            color={isStarted(bigRunShifts[0]) ? Color.BigRun : undefined}
            rule={t("big_run")}
            stages={[t(getCoopStageId(bigRunShifts[0]))]}
            onPress={onBigRunShiftPress}
            style={ViewStyles.mr2}
          />
        )}
        {regularShifts?.[0] && (
          <ScheduleButton
            color={isStarted(regularShifts[0]) ? Color.SalmonRun : undefined}
            rule={t("salmon_run")}
            stages={[t(getCoopStageId(regularShifts[0]))]}
            onPress={onRegularShiftPress}
          />
        )}
      </HStack>
      <Modal
        isVisible={displaySplatfest}
        onClose={onDisplaySplatfestClose}
        style={ViewStyles.modal2d}
      >
        <ScheduleList color={display?.color} title={display?.title}>
          {display?.splatfest && (
            <ScheduleBox
              rule={t("VnNSdWxlLTU=")}
              time={getTimeRange(display.splatfest, true)}
              stages={[formatStage(getSplatfestStage(display.splatfest))]}
            />
          )}
        </ScheduleList>
      </Modal>
      <Modal
        isVisible={displaySchedules}
        onClose={onDisplaySchedulesClose}
        style={ViewStyles.modal2d}
      >
        <ScheduleList color={display?.color} title={display?.title}>
          {display?.schedules &&
            display.schedules
              .filter((schedule) => getMatchSetting(schedule, display.index))
              .map((schedule, i) => (
                <ScheduleBox
                  key={i}
                  rule={t(getVsRuleId(schedule, display.index))}
                  time={getTimeRange(schedule, false)}
                  stages={getVsStages(schedule, display.index).map(formatStage)}
                  style={i !== display.schedules!.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
        </ScheduleList>
      </Modal>
      <Modal isVisible={displayShifts} onClose={onDisplayShiftsClose} style={ViewStyles.modal2d}>
        <ScheduleList color={display?.color} title={display?.title}>
          {display?.shifts &&
            display.shifts
              .filter((shift) => getShiftSetting(shift))
              .map((shift, i) => (
                <ShiftBox
                  key={i}
                  rule={display.title}
                  time={getTimeRange(shift, true)}
                  stage={formatStage(getCoopStage(shift))}
                  weapons={getCoopWeapons(shift).map(formatWeapon)}
                  style={i !== display.shifts!.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
        </ScheduleList>
      </Modal>
    </ScrollView>
  );
};

export default ScheduleView;
