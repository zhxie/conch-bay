import dayjs from "dayjs";
import "dayjs/plugin/advancedFormat";
import { useState } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import {
  Color,
  HStack,
  Modal,
  ScheduleBox,
  ScheduleButton,
  ShiftBox,
  TitledList,
  ViewStyles,
} from "../components";
import { CoopWeapon, Schedule, Schedules, Shift, Splatfest, VsStage } from "../models/types";
import {
  getCoopStage,
  getCoopStageId,
  getCoopWeapons,
  getImageCacheSource,
  getMatchSetting,
  getShiftSetting,
  getSplatfestStage,
  getSplatfestStageId,
  getVsRuleId,
  getVsStageIds,
  getVsStages,
  isScheduleStarted,
  isSplatfestStarted,
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

  const [display, setDisplay] = useState<DisplayProps>();
  const [displaySplatfest, setDisplaySplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);
  const [displayShifts, setDisplayShifts] = useState(false);

  const splatfestSchedules = props.schedules?.festSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const currentSplatfest = props.schedules?.currentFest?.tricolorStage
    ? props.schedules?.currentFest
    : undefined;
  const regularSchedules = props.schedules?.regularSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const anarchySchedules = props.schedules?.bankaraSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const xSchedules = props.schedules?.xSchedules.nodes.filter((node) => getMatchSetting(node));
  const bigRunShifts = props.schedules?.coopGroupingSchedule.bigRunSchedules.nodes;
  const regularShifts = props.schedules?.coopGroupingSchedule.regularSchedules.nodes;

  const formatTime = (time: string, end: boolean, withDate: boolean) => {
    const dateFormat = "M/D";
    const timeFormat = "HH:mm";
    const dateTimeFormat = "M/D HH:mm";

    const nowCheck = dayjs().format(dateFormat);
    const dateTime = dayjs(time).format(dateTimeFormat);
    const timeCheck = dateTime.split(" ");
    // Same day.
    if (nowCheck === timeCheck[0]) {
      if (withDate) {
        return dateTime;
      }
      return dayjs(time).format(timeFormat);
    }
    // Different day.
    if (end && timeCheck[1] === "00:00") {
      const prevDate = dayjs(time).add(-1, "day").format(dateFormat);
      if (prevDate === nowCheck && !withDate) {
        return "24:00";
      }
      return `${prevDate} 24:00`;
    }
    return dateTime;
  };
  const formatScheduleTimeRange = (schedule: Schedule, withDate: boolean) => {
    const startTime = formatTime(schedule.startTime, false, withDate);
    const endTime = formatTime(schedule.endTime, true, withDate);

    return `${startTime} - ${endTime}`;
  };
  const formatSplatfestTimeRange = (splatfest: Splatfest) => {
    const startTime = formatTime(splatfest.midtermTime, false, true);
    const endTime = formatTime(splatfest.endTime, true, true);

    return `${startTime} - ${endTime}`;
  };
  const formatStage = (stage: VsStage) => {
    return {
      title: t(stage.id),
      image: getImageCacheSource(stage.image.url),
    };
  };
  const formatWeapon = (weapon: CoopWeapon) => {
    return getImageCacheSource(weapon.image.url);
  };

  const onSplatfestSchedulePress = () => {
    setDisplay({
      title: t("splatfest_battle"),
      color: Color.AccentColor,
      schedules: splatfestSchedules,
    });
    setDisplaySchedules(true);
  };
  const onCurrentSplatfestPress = () => {
    setDisplay({
      title: t("tricolor_battle"),
      color: Color.AccentColor,
      splatfest: currentSplatfest,
    });
    setDisplaySplatfest(true);
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
  const onDisplaySchedulesClose = () => {
    setDisplaySchedules(false);
  };
  const onDisplaySplatfestClose = () => {
    setDisplaySplatfest(false);
  };
  const onDisplayShiftsClose = () => {
    setDisplayShifts(false);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack style={ViewStyles.px4}>
        {!props.schedules &&
          new Array(8)
            .fill(0)
            .map((_, i) => (
              <ScheduleButton
                key={i}
                rule=""
                stages={[]}
                style={i !== 7 ? ViewStyles.mr2 : undefined}
              />
            ))}
        {splatfestSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(splatfestSchedules[0]) ? Color.AccentColor : undefined}
            rule={t(getVsRuleId(splatfestSchedules[0]))}
            stages={getVsStageIds(splatfestSchedules[0]).map((schedule) => t(schedule))}
            onPress={onSplatfestSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {currentSplatfest && (
          <ScheduleButton
            color={isSplatfestStarted(currentSplatfest) ? Color.AccentColor : undefined}
            rule={t("VnNSdWxlLTU=")}
            stages={[t(getSplatfestStageId(currentSplatfest))]}
            onPress={onCurrentSplatfestPress}
            style={ViewStyles.mr2}
          />
        )}
        {regularSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(regularSchedules[0]) ? Color.RegularBattle : undefined}
            rule={t(getVsRuleId(regularSchedules[0]))}
            stages={getVsStageIds(regularSchedules[0]).map((schedule) => t(schedule))}
            onPress={onRegularSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={t(getVsRuleId(anarchySchedules[0], 0))}
            stages={getVsStageIds(anarchySchedules[0], 0).map((schedule) => t(schedule))}
            onPress={onAnarchySeriesSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={t(getVsRuleId(anarchySchedules[0], 1))}
            stages={getVsStageIds(anarchySchedules[0], 1).map((schedule) => t(schedule))}
            onPress={onAnarchyOpenSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {xSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(xSchedules[0]) ? Color.XBattle : undefined}
            rule={t(getVsRuleId(xSchedules[0]))}
            stages={getVsStageIds(xSchedules[0]).map((schedule) => t(schedule))}
            onPress={onXSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {bigRunShifts?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(bigRunShifts[0]) ? Color.BigRun : undefined}
            rule={t("big_run")}
            stages={[t(getCoopStageId(bigRunShifts[0]))]}
            onPress={onBigRunShiftPress}
            style={ViewStyles.mr2}
          />
        )}
        {regularShifts?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(regularShifts[0]) ? Color.SalmonRun : undefined}
            rule={t("salmon_run")}
            stages={[t(getCoopStageId(regularShifts[0]))]}
            onPress={onRegularShiftPress}
          />
        )}
      </HStack>
      <Modal
        isVisible={displaySchedules}
        onClose={onDisplaySchedulesClose}
        style={ViewStyles.modal2d}
      >
        <TitledList color={display?.color} title={display?.title}>
          {display?.schedules &&
            display.schedules
              .filter((schedule) => getMatchSetting(schedule, display.index))
              .map((schedule, i, schedules) => (
                <ScheduleBox
                  key={i}
                  rule={t(getVsRuleId(schedule, display.index))}
                  time={formatScheduleTimeRange(schedule, false)}
                  stages={getVsStages(schedule, display.index).map(formatStage)}
                  style={i !== schedules.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
        </TitledList>
      </Modal>
      <Modal
        isVisible={displaySplatfest}
        onClose={onDisplaySplatfestClose}
        style={ViewStyles.modal2d}
      >
        <TitledList color={display?.color} title={display?.title}>
          {display?.splatfest && (
            <ScheduleBox
              rule={t("VnNSdWxlLTU=")}
              time={formatSplatfestTimeRange(display.splatfest)}
              stages={[formatStage(getSplatfestStage(display.splatfest))]}
            />
          )}
        </TitledList>
      </Modal>
      <Modal isVisible={displayShifts} onClose={onDisplayShiftsClose} style={ViewStyles.modal2d}>
        <TitledList color={display?.color} title={display?.title}>
          {display?.shifts &&
            display.shifts
              .filter((shift) => getShiftSetting(shift))
              .map((shift, i, shifts) => (
                <ShiftBox
                  key={i}
                  rule={display.title}
                  time={formatScheduleTimeRange(shift, true)}
                  stage={formatStage(getCoopStage(shift))}
                  weapons={getCoopWeapons(shift).map(formatWeapon)}
                  style={i !== shifts.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
        </TitledList>
      </Modal>
    </ScrollView>
  );
};

export default ScheduleView;
