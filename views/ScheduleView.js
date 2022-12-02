import { HStack, ScrollView } from "native-base";
import { ScheduleBox } from "../components";

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
  };
  const firstRegularSchedule = getFirstSchedule(regularSchedules, "regularMatchSetting");
  const firstAnarchySchedule = getFirstSchedule(anarchySchedules, "bankaraMatchSettings");
  const firstXSchedule = getFirstSchedule(xSchedules, "xMatchSetting");
  const firstSplatfestSchedule = getFirstSchedule(festSchedules, "festMatchSettings");
  const isStarted = (schedule) => {
    if (!schedule) {
      return false;
    }

    const now = new Date().getTime();
    const date = new Date(schedule["startTime"]);
    const timestamp = date.getTime();
    return timestamp < now;
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

  return (
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator="false">
      <HStack space={2} px={4}>
        {firstSplatfestSchedule !== undefined && (
          <ScheduleBox
            color={accentColor}
            isLoaded={firstSplatfestSchedule}
            valid={isStarted(firstSplatfestSchedule)}
            title={getRule(firstSplatfestSchedule, "festMatchSetting")}
            stages={getStages(firstSplatfestSchedule, "festMatchSetting")}
          />
        )}
        {firstRegularSchedule !== undefined && (
          <ScheduleBox
            color="green.500"
            isLoaded={firstRegularSchedule}
            valid={isStarted(firstRegularSchedule)}
            title={getRule(firstRegularSchedule, "regularMatchSetting")}
            stages={getStages(firstRegularSchedule, "regularMatchSetting")}
          />
        )}
        {firstAnarchySchedule !== undefined && (
          <ScheduleBox
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, "bankaraMatchSettings", 0)}
            stages={getStages(firstAnarchySchedule, "bankaraMatchSettings", 0)}
          />
        )}
        {firstAnarchySchedule !== undefined && (
          <ScheduleBox
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, "bankaraMatchSettings", 1)}
            stages={getStages(firstAnarchySchedule, "bankaraMatchSettings", 1)}
          />
        )}
        {firstXSchedule !== undefined && (
          <ScheduleBox
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
