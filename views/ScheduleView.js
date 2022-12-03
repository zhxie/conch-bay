import { HStack, ScrollView } from "native-base";
import { ScheduleButton } from "../components";

const ScheduleView = (props) => {
  const { t, accentColor, schedules } = props;

  const regularSchedules = schedules?.["data"]["regularSchedules"]["nodes"];
  const anarchySchedules = schedules?.["data"]["bankaraSchedules"]["nodes"];
  const xSchedules = schedules?.["data"]["xSchedules"]["nodes"];
  const festSchedules = schedules?.["data"]["festSchedules"]["nodes"];
  const getFirstSchedule = (schedules, matchSetting) => {
    if (!schedules) {
      return schedules;
    }

    for (const schedule of schedules) {
      if (!schedule[matchSetting]) {
        continue;
      }
      return schedule;
    }
    return null;
  };
  const firstRegularSchedule = getFirstSchedule(regularSchedules, "regularMatchSetting");
  const firstAnarchySchedule = getFirstSchedule(anarchySchedules, "bankaraMatchSettings");
  const firstXSchedule = getFirstSchedule(xSchedules, "xMatchSetting");
  const firstSplatfestSchedule = getFirstSchedule(festSchedules, "festMatchSetting");
  const isStarted = (schedule) => {
    if (!schedule) {
      return false;
    }

    const now = new Date().getTime();
    const date = new Date(schedule["startTime"]);
    const timestamp = date.getTime();
    return timestamp <= now;
  };
  const getRule = (schedule, matchSetting, index) => {
    if (!schedule) {
      return "";
    }

    let setting;
    if (index === undefined) {
      setting = schedule[matchSetting];
    } else {
      setting = schedule[matchSetting][index];
    }
    return t(setting["vsRule"]["id"]);
  };
  const getStages = (schedule, matchSetting, index) => {
    if (!schedule) {
      return [];
    }

    let setting;
    if (index === undefined) {
      setting = schedule[matchSetting];
    } else {
      setting = schedule[matchSetting][index];
    }
    let stages = [];
    for (let stage of setting["vsStages"]) {
      stages.push(t(stage["id"]));
    }
    return stages;
  };
  const currentFest = schedules?.["data"]["currentFest"];
  const currentFestStage = currentFest ? [t(currentFest["tricolorStage"]["id"])] : [];

  return (
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator="false">
      <HStack space={2} px={4}>
        {currentFest !== null && (
          <ScheduleButton
            color={accentColor}
            isLoaded={currentFest}
            valid={isStarted(currentFest)}
            title={t("VnNSdWxlLTU=")}
            stages={currentFestStage}
          />
        )}
        {firstSplatfestSchedule !== null && (
          <ScheduleButton
            color={accentColor}
            isLoaded={firstSplatfestSchedule}
            valid={isStarted(firstSplatfestSchedule)}
            title={getRule(firstSplatfestSchedule, "festMatchSetting")}
            stages={getStages(firstSplatfestSchedule, "festMatchSetting")}
          />
        )}
        {firstRegularSchedule !== null && (
          <ScheduleButton
            color="green.500"
            isLoaded={firstRegularSchedule}
            valid={isStarted(firstRegularSchedule)}
            title={getRule(firstRegularSchedule, "regularMatchSetting")}
            stages={getStages(firstRegularSchedule, "regularMatchSetting")}
          />
        )}
        {firstAnarchySchedule !== null && (
          <ScheduleButton
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, "bankaraMatchSettings", 0)}
            stages={getStages(firstAnarchySchedule, "bankaraMatchSettings", 0)}
          />
        )}
        {firstAnarchySchedule !== null && (
          <ScheduleButton
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, "bankaraMatchSettings", 1)}
            stages={getStages(firstAnarchySchedule, "bankaraMatchSettings", 1)}
          />
        )}
        {firstXSchedule !== null && (
          <ScheduleButton
            color="emerald.400"
            isLoaded={firstXSchedule}
            valid={isStarted(firstXSchedule)}
            title={getRule(firstXSchedule, "xMatchSetting")}
            stages={getStages(firstXSchedule, "xMatchSetting")}
          />
        )}
      </HStack>
    </ScrollView>
  );
};

export default ScheduleView;
