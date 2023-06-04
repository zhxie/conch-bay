import dayjs from "dayjs";
import "dayjs/plugin/advancedFormat";
import { useMemo, useState } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import {
  Color,
  HStack,
  Marquee,
  Modal,
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
  BankaraMatchSetting,
  CoopGroupingSchedule,
  CoopStage,
  CoopSupplyWeapon,
  CurrentFest,
  EventMatchTimePeriod,
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
interface DisplayProps {
  title: string;
  color: string;
  splatfest?: CurrentFest;
  schedules?: VsSchedule[];
  challenges?: VsEventSchedule[];
  shifts?: CoopGroupingSchedule[];
  index?: number;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const theme = useTheme();

  const [display, setDisplay] = useState<DisplayProps>();
  const [displaySplatfest, setDisplaySplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);
  const [displayShifts, setDisplayShifts] = useState(false);

  const getMatchSetting = (schedule: VsSchedule, index?: number) => {
    const regularMatchSetting = schedule["regularMatchSetting"];
    if (regularMatchSetting !== undefined) {
      return regularMatchSetting as RegularMatchSetting | null;
    }
    const anarchyMatchSettings = schedule["bankaraMatchSettings"];
    if (anarchyMatchSettings !== undefined) {
      if (anarchyMatchSettings === null) {
        return null;
      }
      return (anarchyMatchSettings as BankaraMatchSetting[])[index ?? 0];
    }
    const xMatchSetting = schedule["xMatchSetting"];
    if (xMatchSetting !== undefined) {
      return xMatchSetting as XMatchSetting | null;
    }
    return schedule["festMatchSetting"] as FestMatchSetting | null;
  };
  const isScheduleExpired = (
    schedule: VsSchedule | EventMatchTimePeriod | CoopGroupingSchedule
  ) => {
    const now = new Date().getTime();
    const date = new Date(schedule.endTime);
    const timestamp = date.getTime();
    return timestamp <= now;
  };
  const isSplatfestExpired = (splatfest: CurrentFest) => {
    const now = new Date().getTime();
    const date = new Date(splatfest.endTime);
    const timestamp = date.getTime();
    return timestamp <= now;
  };

  const splatfestSchedules = useMemo(
    () =>
      props.schedules?.festSchedules.nodes
        .filter((node) => getMatchSetting(node))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const currentSplatfest =
    props.schedules?.currentFest?.tricolorStage && !isSplatfestExpired(props.schedules.currentFest)
      ? props.schedules.currentFest
      : undefined;
  const regularSchedules = useMemo(
    () =>
      props.schedules?.regularSchedules.nodes
        .filter((node) => getMatchSetting(node))
        .filter((node) => !isScheduleExpired(node)),
    [props.schedules]
  );
  const anarchySchedules = useMemo(
    () =>
      props.schedules?.bankaraSchedules.nodes
        .filter((node) => getMatchSetting(node))
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
      props.schedules?.eventSchedules.nodes.filter(
        (node) => !isScheduleExpired(node.timePeriods[node.timePeriods.length - 1])
      ),
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
  const isSplatfestStarted = (splatfest: CurrentFest) => {
    const now = new Date().getTime();
    const date = new Date(splatfest.midtermTime);
    const timestamp = date.getTime();
    return timestamp <= now;
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
      const prevDate = dayjs(time).add(-1, "day").format(dateFormat);
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

    return `${startTime} - ${endTime}`;
  };
  const formatSplatfestTimeRange = (splatfest: CurrentFest) => {
    const startTime = formatTime(splatfest.midtermTime, false, true);
    const endTime = formatTime(splatfest.endTime, true, true);

    return `${startTime} - ${endTime}`;
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
  const onChallengePress = () => {
    setDisplay({
      title: t("challenge_b"),
      color: Color.Challenge,
      challenges: challenges,
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
  const onEggstraWorkShiftPress = () => {
    setDisplay({
      title: t("eggstra_work"),
      color: Color.EggstraWork,
      shifts: eggstraWorkShifts,
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
          new Array(10)
            .fill(0)
            .map((_, i) => (
              <ScheduleButton
                key={i}
                rule=""
                stages={[]}
                style={props.children || i !== 9 ? ViewStyles.mr2 : undefined}
              />
            ))}
        {splatfestSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(splatfestSchedules[0]) ? Color.AccentColor : undefined}
            rule={td(getMatchSetting(splatfestSchedules[0])!.vsRule)}
            stages={getMatchSetting(splatfestSchedules[0])!.vsStages.map((stage) => td(stage))}
            onPress={onSplatfestSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {currentSplatfest && (
          <ScheduleButton
            color={isSplatfestStarted(currentSplatfest) ? Color.AccentColor : undefined}
            rule={t("VnNSdWxlLTU=")}
            stages={[td(currentSplatfest.tricolorStage)]}
            onPress={onCurrentSplatfestPress}
            style={ViewStyles.mr2}
          />
        )}
        {regularSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(regularSchedules[0]) ? Color.RegularBattle : undefined}
            rule={td(getMatchSetting(regularSchedules[0])!.vsRule)}
            stages={getMatchSetting(regularSchedules[0])!.vsStages.map((stage) => td(stage))}
            onPress={onRegularSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={td(getMatchSetting(anarchySchedules[0], 0)!.vsRule)}
            stages={getMatchSetting(anarchySchedules[0], 0)!.vsStages.map((stage) => td(stage))}
            onPress={onAnarchySeriesSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {anarchySchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(anarchySchedules[0]) ? Color.AnarchyBattle : undefined}
            rule={td(getMatchSetting(anarchySchedules[0], 1)!.vsRule)}
            stages={getMatchSetting(anarchySchedules[0], 1)!.vsStages.map((stage) => td(stage))}
            onPress={onAnarchyOpenSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {xSchedules?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(xSchedules[0]) ? Color.XBattle : undefined}
            rule={td(getMatchSetting(xSchedules[0])!.vsRule)}
            stages={getMatchSetting(xSchedules[0])!.vsStages.map((stage) => td(stage))}
            onPress={onXSchedulePress}
            style={ViewStyles.mr2}
          />
        )}
        {challenges?.[0] && (
          <ScheduleButton
            color={isChallengeStarted(challenges[0]) ? Color.Challenge : undefined}
            rule={td(challenges[0].leagueMatchSetting.vsRule)}
            stages={challenges[0].leagueMatchSetting.vsStages.map((stage) => td(stage))}
            onPress={onChallengePress}
            style={ViewStyles.mr2}
          />
        )}
        {bigRunShifts?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(bigRunShifts[0]) ? Color.BigRun : undefined}
            rule={t("big_run")}
            stages={[td(bigRunShifts[0].setting!.coopStage)]}
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
            stages={[td(regularShifts[0].setting!.coopStage)]}
            onPress={onRegularShiftPress}
            style={!!props.children && ViewStyles.mr2}
          />
        )}
        {props.children}
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
                  rule={td(getMatchSetting(schedule, display.index)!.vsRule)}
                  time={formatScheduleTimeRange(schedule, false)}
                  stages={getMatchSetting(schedule, display.index)!.vsStages.map(formatStage)}
                  style={i !== schedules.length - 1 ? ViewStyles.mb2 : undefined}
                />
              ))}
          {display?.challenges &&
            display.challenges.map((challenge, i, challenges) => (
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
              stages={[formatStage(display.splatfest.tricolorStage)]}
            />
          )}
        </TitledList>
      </Modal>
      <Modal isVisible={displayShifts} onClose={onDisplayShiftsClose} style={ViewStyles.modal2d}>
        <TitledList color={display?.color} title={display?.title}>
          {display?.shifts &&
            display.shifts
              .filter((shift) => shift.setting)
              .map((shift, i, shifts) => (
                <ShiftBox
                  key={i}
                  rule={display.title}
                  time={formatScheduleTimeRange(shift, true)}
                  stage={formatStage(shift.setting!.coopStage)}
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
