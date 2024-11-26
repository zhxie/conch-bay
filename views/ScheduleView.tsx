import dayjs from "dayjs";
import "dayjs/plugin/advancedFormat";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleProp, ViewStyle, useWindowDimensions } from "react-native";
import {
  Color,
  HStack,
  Marquee,
  Modal,
  SalmonRunSwitcher,
  ScheduleBox,
  ScheduleButton,
  ShiftBox,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t, { td } from "../i18n";
import {
  BankaraMatchMode,
  BankaraMatchSetting,
  CoopGroupingSchedule,
  CoopStage,
  CoopSupplyWeapon,
  EventMatchTimePeriod,
  FestMatchMode,
  FestMatchSetting,
  RegularMatchSetting,
  Schedules,
  VsEventSchedule,
  VsSchedule,
  VsStage,
  XMatchSetting,
} from "../models/types";
import { getImageCacheSource, getImageHash } from "../utils/ui";

interface ScheduleViewProps {
  schedules?: Schedules;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}
interface TricolorSchedule {
  startTime: string;
  endTime: string;
  stages: {
    id: string;
    name: string;
    image: {
      url: string;
    };
  }[];
}
interface ScheduleList {
  title: string;
  color: string;
  tricolorSchedules?: TricolorSchedule[];
  schedules?: VsSchedule[];
  challenges?: VsEventSchedule[];
  shifts?: CoopGroupingSchedule[];
  mode?: BankaraMatchMode | FestMatchMode;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const { width } = useWindowDimensions();
  const placeholder = Math.ceil((width - 32) / 168);

  const theme = useTheme();

  const [scheduleList, setScheduleList] = useState<ScheduleList>();
  const [schedules, setSchedules] = useState(false);

  const getMatchSetting = (schedule: VsSchedule, mode?: BankaraMatchMode | FestMatchMode) => {
    const regularMatchSetting = schedule["regularMatchSetting"];
    if (regularMatchSetting !== undefined) {
      return regularMatchSetting as RegularMatchSetting | null;
    }
    const anarchyMatchSettings = schedule["bankaraMatchSettings"];
    if (anarchyMatchSettings !== undefined) {
      if (anarchyMatchSettings === null) {
        return null;
      }
      if (mode) {
        switch (mode) {
          case BankaraMatchMode.CHALLENGE:
          case BankaraMatchMode.OPEN:
            return (anarchyMatchSettings as BankaraMatchSetting[]).find(
              (matchSetting) => matchSetting.bankaraMode === mode
            );
          default:
            throw new Error(`unexpected bankara match mode ${mode}`);
        }
      }
      return (anarchyMatchSettings as BankaraMatchSetting[])[0];
    }
    const xMatchSetting = schedule["xMatchSetting"];
    if (xMatchSetting !== undefined) {
      return xMatchSetting as XMatchSetting | null;
    }
    const splatfestMatchSettings = schedule["festMatchSettings"];
    if (splatfestMatchSettings === null) {
      return null;
    }
    if (mode) {
      switch (mode) {
        case FestMatchMode.CHALLENGE:
        case FestMatchMode.REGULAR:
          return (schedule["festMatchSettings"] as FestMatchSetting[]).find(
            (matchSetting) => matchSetting.festMode === mode
          );
        default:
          throw new Error(`unexpected fest match mode ${mode}`);
      }
    }
    return (schedule["festMatchSettings"] as FestMatchSetting[])[0];
  };
  const isScheduleExpired = (
    schedule: VsSchedule | EventMatchTimePeriod | CoopGroupingSchedule
  ) => {
    const now = new Date().getTime();
    const date = new Date(schedule.endTime);
    const timestamp = date.getTime();
    return timestamp <= now;
  };

  const splatfestOpenSchedules = useMemo(
    () =>
      props.schedules?.festSchedules.nodes
        .filter((node) => getMatchSetting(node, FestMatchMode.REGULAR))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const splatfestProSchedules = useMemo(
    () =>
      props.schedules?.festSchedules.nodes
        .filter((node) => getMatchSetting(node, FestMatchMode.CHALLENGE))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const tricolorSchedules = useMemo(() => {
    if (!props.schedules?.currentFest) {
      return undefined;
    }

    const schedules: TricolorSchedule[] = [];
    if (props.schedules.currentFest.timetable?.[0]) {
      for (const timetable of props.schedules.currentFest.timetable) {
        schedules.push({
          startTime: timetable.startTime,
          endTime: timetable.endTime,
          stages: timetable.festMatchSettings![0].vsStages,
        });
      }
    } else {
      schedules.push({
        startTime: props.schedules.currentFest.midtermTime,
        endTime: props.schedules.currentFest.endTime,
        stages: props.schedules.currentFest.tricolorStages,
      });
    }
    return schedules.filter((schedule) => !isScheduleExpired(schedule));
  }, [props.schedules]);
  const regularSchedules = useMemo(
    () =>
      props.schedules?.regularSchedules.nodes
        .filter((node) => getMatchSetting(node))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const anarchySeriesSchedules = useMemo(
    () =>
      props.schedules?.bankaraSchedules.nodes
        .filter((node) => getMatchSetting(node, BankaraMatchMode.CHALLENGE))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const anarchyOpenSchedules = useMemo(
    () =>
      props.schedules?.bankaraSchedules.nodes
        .filter((node) => getMatchSetting(node, BankaraMatchMode.OPEN))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const xSchedules = useMemo(
    () =>
      props.schedules?.xSchedules.nodes
        .filter((node) => getMatchSetting(node))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const challenges = useMemo(
    () =>
      props.schedules?.eventSchedules.nodes
        .filter((node) => node.timePeriods.length > 0)
        .filter((node) => !isScheduleExpired(node.timePeriods[node.timePeriods.length - 1])),
    [props.schedules]
  );
  const bigRunShifts = useMemo(
    () =>
      props.schedules?.coopGroupingSchedule.bigRunSchedules.nodes.filter(
        (node) => !isScheduleExpired(node)
      ),
    [props.schedules]
  );
  const eggstraWorkShifts = useMemo(
    () =>
      props.schedules?.coopGroupingSchedule.teamContestSchedules.nodes.filter(
        (node) => !isScheduleExpired(node)
      ),
    [props.schedules]
  );
  const regularShifts = useMemo(
    () =>
      props.schedules?.coopGroupingSchedule.regularSchedules.nodes.filter(
        (node) => !isScheduleExpired(node)
      ),
    [props.schedules]
  );

  const isScheduleStarted = (
    schedule: VsSchedule | EventMatchTimePeriod | CoopGroupingSchedule
  ) => {
    const now = new Date().getTime();
    const date = new Date(schedule.startTime);
    const timestamp = date.getTime();
    return timestamp <= now;
  };
  const isChallengeStarted = (schedule: VsEventSchedule) => {
    const i = schedule.timePeriods.findIndex((timePeriod) => !isScheduleExpired(timePeriod));
    if (i < 0) {
      return true;
    }
    return isScheduleStarted(schedule.timePeriods[i]);
  };

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
      const prevDate = dayjs(time).subtract(1, "day").format(dateFormat);
      if (prevDate === nowCheck && !withDate) {
        return "24:00";
      }
      return `${prevDate} 24:00`;
    }
    return dateTime;
  };
  const formatScheduleTimeRange = (
    schedule: VsSchedule | EventMatchTimePeriod | CoopGroupingSchedule,
    withDate: boolean
  ) => {
    const startTime = formatTime(schedule.startTime, false, withDate);
    const endTime = formatTime(schedule.endTime, true, withDate);

    return `${startTime} – ${endTime}`;
  };
  const formatStage = (stage: VsStage | CoopStage) => {
    return {
      title: td(stage),
      image: getImageCacheSource(stage.image.url),
    };
  };
  const formatWeapon = (weapon: CoopSupplyWeapon) => {
    return {
      image: getImageCacheSource(weapon.image.url),
      tintColor:
        theme.colorScheme === "light" &&
        getImageHash(weapon.image.url) ===
          "a23d035e2f37c502e85b6065ba777d93f42d6ca7017ed029baac6db512e3e17f"
          ? "#0a0a0a"
          : undefined,
    };
  };

  const onSplatfestOpenSchedulePress = () => {
    setScheduleList({
      title: t("splatfest_battle_open"),
      color: Color.AccentColor,
      schedules: splatfestOpenSchedules,
      mode: FestMatchMode.REGULAR,
    });
    setSchedules(true);
  };
  const onSplatfestProSchedulePress = () => {
    setScheduleList({
      title: t("splatfest_battle_pro"),
      color: Color.AccentColor,
      schedules: splatfestProSchedules,
      mode: FestMatchMode.CHALLENGE,
    });
    setSchedules(true);
  };
  const onCurrentSplatfestPress = () => {
    setScheduleList({
      title: t("tricolor_battle"),
      color: Color.AccentColor,
      tricolorSchedules: tricolorSchedules,
    });
    setSchedules(true);
  };
  const onRegularSchedulePress = () => {
    setScheduleList({
      title: t("regular_battle"),
      color: Color.RegularBattle,
      schedules: regularSchedules,
    });
    setSchedules(true);
  };
  const onAnarchySeriesSchedulePress = () => {
    setScheduleList({
      title: t("anarchy_battle_series"),
      color: Color.AnarchyBattle,
      schedules: anarchySeriesSchedules,
      mode: BankaraMatchMode.CHALLENGE,
    });
    setSchedules(true);
  };
  const onAnarchyOpenSchedulePress = () => {
    setScheduleList({
      title: t("anarchy_battle_open"),
      color: Color.AnarchyBattle,
      schedules: anarchyOpenSchedules,
      mode: BankaraMatchMode.OPEN,
    });
    setSchedules(true);
  };
  const onXSchedulePress = () => {
    setScheduleList({
      title: t("x_battle"),
      color: Color.XBattle,
      schedules: xSchedules,
    });
    setSchedules(true);
  };
  const onChallengePress = () => {
    setScheduleList({
      title: t("challenge_b"),
      color: Color.Challenge,
      challenges: challenges,
    });
    setSchedules(true);
  };
  const onBigRunShiftPress = () => {
    setScheduleList({
      title: t("big_run"),
      color: Color.BigRun,
      shifts: bigRunShifts,
    });
    setSchedules(true);
  };
  const onEggstraWorkShiftPress = () => {
    setScheduleList({
      title: t("eggstra_work"),
      color: Color.EggstraWork,
      shifts: eggstraWorkShifts,
    });
    setSchedules(true);
  };
  const onRegularShiftPress = () => {
    setScheduleList({
      title: t("salmon_run"),
      color: Color.SalmonRun,
      shifts: regularShifts,
    });
    setSchedules(true);
  };
  const onSchedulesDismiss = () => {
    setSchedules(false);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack style={ViewStyles.px4}>
        {!props.schedules &&
          new Array(placeholder)
            .fill(0)
            .map((_, i) => (
              <ScheduleButton
                key={i}
                disabled
                rule=""
                stages={[]}
                style={props.children || i !== 9 ? ViewStyles.mr2 : undefined}
              />
            ))}
        <SalmonRunSwitcher>
          <>
            {splatfestOpenSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(splatfestOpenSchedules[0]) ? Color.AccentColor : undefined}
                rule={td(getMatchSetting(splatfestOpenSchedules[0], FestMatchMode.REGULAR)!.vsRule)}
                stages={getMatchSetting(
                  splatfestOpenSchedules[0],
                  FestMatchMode.REGULAR
                )!.vsStages.map(td)}
                onPress={onSplatfestOpenSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {splatfestProSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(splatfestProSchedules[0]) ? Color.AccentColor : undefined}
                rule={td(
                  getMatchSetting(splatfestProSchedules[0], FestMatchMode.CHALLENGE)!.vsRule
                )}
                stages={getMatchSetting(
                  splatfestProSchedules[0],
                  FestMatchMode.CHALLENGE
                )!.vsStages.map(td)}
                onPress={onSplatfestProSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {tricolorSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(tricolorSchedules[0]) ? Color.AccentColor : undefined}
                rule={t("VnNSdWxlLTU=")}
                stages={tricolorSchedules[0].stages.map(td)}
                onPress={onCurrentSplatfestPress}
                style={ViewStyles.mr2}
              />
            )}
            {regularSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(regularSchedules[0]) ? Color.RegularBattle : undefined}
                rule={td(getMatchSetting(regularSchedules[0])!.vsRule)}
                stages={getMatchSetting(regularSchedules[0])!.vsStages.map(td)}
                onPress={onRegularSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {anarchySeriesSchedules?.[0] && (
              <ScheduleButton
                color={
                  isScheduleStarted(anarchySeriesSchedules[0]) ? Color.AnarchyBattle : undefined
                }
                rule={td(
                  getMatchSetting(anarchySeriesSchedules[0], BankaraMatchMode.CHALLENGE)!.vsRule
                )}
                stages={getMatchSetting(
                  anarchySeriesSchedules[0],
                  BankaraMatchMode.CHALLENGE
                )!.vsStages.map(td)}
                onPress={onAnarchySeriesSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {anarchyOpenSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(anarchyOpenSchedules[0]) ? Color.AnarchyBattle : undefined}
                rule={td(getMatchSetting(anarchyOpenSchedules[0], BankaraMatchMode.OPEN)!.vsRule)}
                stages={getMatchSetting(
                  anarchyOpenSchedules[0],
                  BankaraMatchMode.OPEN
                )!.vsStages.map(td)}
                onPress={onAnarchyOpenSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {xSchedules?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(xSchedules[0]) ? Color.XBattle : undefined}
                rule={td(getMatchSetting(xSchedules[0])!.vsRule)}
                stages={getMatchSetting(xSchedules[0])!.vsStages.map(td)}
                onPress={onXSchedulePress}
                style={ViewStyles.mr2}
              />
            )}
            {challenges?.[0] && (
              <ScheduleButton
                color={isChallengeStarted(challenges[0]) ? Color.Challenge : undefined}
                rule={td(challenges[0].leagueMatchSetting.vsRule)}
                stages={challenges[0].leagueMatchSetting.vsStages.map(td)}
                onPress={onChallengePress}
                style={ViewStyles.mr2}
              />
            )}
          </>
          <>
            {bigRunShifts?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(bigRunShifts[0]) ? Color.BigRun : undefined}
                rule={t("big_run")}
                stages={[td(bigRunShifts[0].setting!.coopStage), td(bigRunShifts[0].setting!.boss)]}
                onPress={onBigRunShiftPress}
                style={ViewStyles.mr2}
              />
            )}
            {eggstraWorkShifts?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(eggstraWorkShifts[0]) ? Color.EggstraWork : undefined}
                rule={t("eggstra_work")}
                stages={[td(eggstraWorkShifts[0].setting!.coopStage)]}
                onPress={onEggstraWorkShiftPress}
                style={ViewStyles.mr2}
              />
            )}
            {regularShifts?.[0] && (
              <ScheduleButton
                color={isScheduleStarted(regularShifts[0]) ? Color.SalmonRun : undefined}
                rule={t("salmon_run")}
                stages={[
                  td(regularShifts[0].setting!.coopStage),
                  td(regularShifts[0].setting!.boss),
                ]}
                onPress={onRegularShiftPress}
                style={!!props.children && ViewStyles.mr2}
              />
            )}
          </>
        </SalmonRunSwitcher>
        {props.children}
      </HStack>
      <Modal isVisible={schedules} size="medium" onDismiss={onSchedulesDismiss}>
        <TitledList color={scheduleList?.color} title={scheduleList?.title}>
          {scheduleList?.schedules &&
            scheduleList.schedules
              .filter((schedule) => getMatchSetting(schedule, scheduleList.mode))
              .map((schedule, i, schedules) => (
                <ScheduleBox
                  key={i}
                  rule={td(getMatchSetting(schedule, scheduleList.mode)!.vsRule)}
                  time={formatScheduleTimeRange(schedule, false)}
                  stages={getMatchSetting(schedule, scheduleList.mode)!.vsStages.map(formatStage)}
                  style={i !== schedules.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
          {scheduleList?.challenges &&
            scheduleList.challenges.map((challenge, i, challenges) => (
              <VStack
                key={i}
                style={[ViewStyles.wf, i !== challenges.length - 1 ? ViewStyles.mb4 : undefined]}
              >
                <Marquee style={[TextStyles.h2, ViewStyles.mb1]}>
                  {td(challenge.leagueMatchSetting.leagueMatchEvent)}
                </Marquee>
                {challenge.timePeriods
                  .slice(
                    // A magic to keep at least 1 time period even if all of them are expired.
                    challenge.timePeriods.findIndex((timePeriod) => !isScheduleExpired(timePeriod))
                  )
                  .map((timePeriod, j, timePeriods) => (
                    <ScheduleBox
                      key={j}
                      rule={td(challenge.leagueMatchSetting.vsRule)}
                      time={formatScheduleTimeRange(timePeriod, false)}
                      stages={challenge.leagueMatchSetting.vsStages.map(formatStage)}
                      style={j !== timePeriods.length - 1 ? ViewStyles.mb2 : undefined}
                    />
                  ))}
              </VStack>
            ))}
          {scheduleList?.tricolorSchedules &&
            scheduleList.tricolorSchedules.map((schedule, i, schedules) => (
              <ScheduleBox
                key={i}
                rule={t("VnNSdWxlLTU=")}
                time={formatScheduleTimeRange(schedule, false)}
                stages={schedule.stages.map(formatStage)}
                style={i !== schedules.length - 1 ? ViewStyles.mb2 : undefined}
              />
            ))}
          {scheduleList?.shifts &&
            scheduleList.shifts
              .filter((shift) => shift.setting)
              .map((shift, i, shifts) => (
                <ShiftBox
                  key={i}
                  rule={scheduleList.title}
                  time={formatScheduleTimeRange(shift, true)}
                  stage={formatStage(shift.setting!.coopStage)}
                  boss={shift.setting!.boss ? td(shift.setting!.boss) : ""}
                  weapons={shift.setting!.weapons.map(formatWeapon)}
                  style={i !== shifts.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
        </TitledList>
      </Modal>
    </ScrollView>
  );
};

export default ScheduleView;
