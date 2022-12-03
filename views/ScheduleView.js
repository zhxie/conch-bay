import dayjs from "dayjs";
import { CircleIcon, HStack, Modal, ScrollView, Text, VStack } from "native-base";
import { useState } from "react";
import { ScheduleBox, ScheduleButton } from "../components";

const ScheduleView = (props) => {
  const { t, accentColor, schedules } = props;

  const [display, setDisplay] = useState(undefined);
  const [displayCurrentSplatfest, setDisplayCurrentSplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);

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
  const getMatchSetting = (schedule, select) => {
    if (!schedule) {
      return schedule;
    }

    return select.reduce((prev, current) => prev?.[current], schedule);
  };
  const getRule = (schedule, select) => {
    if (!schedule) {
      return "";
    }

    const setting = getMatchSetting(schedule, select);
    return t(setting["vsRule"]["id"]);
  };
  const getStages = (schedule, select) => {
    if (!schedule) {
      return [];
    }

    const setting = getMatchSetting(schedule, select);
    return setting["vsStages"];
  };
  const getStageTitles = (schedule, select) => {
    const stages = getStages(schedule, select);
    let result = [];
    for (let stage of stages) {
      result.push(t(stage["id"]));
    }
    return result;
  };
  const currentSplatfest = schedules?.["data"]["currentFest"];
  const currentSplatfestStage = currentSplatfest
    ? [t(currentSplatfest["tricolorStage"]["id"])]
    : [];
  const getTimeRange = (schedule, withDate) => {
    let format = "HH:mm";
    if (withDate) {
      format = "M/DD HH:mm";
    }

    const startTime = dayjs(schedule["startTime"]).format(format);
    const endTime = dayjs(schedule["endTime"]).format(format);

    return `${startTime} - ${endTime}`;
  };
  const formatStage = (stage) => {
    return {
      title: t(stage["id"]),
      image: stage["image"]["url"],
    };
  };

  const onCurrentSplatfestPress = () => {
    if (currentSplatfest) {
      setDisplay({
        title: t("tricolor_battle"),
        color: accentColor,
      });
      setDisplayCurrentSplatfest(true);
    }
  };
  const onSplatfestSchedulePress = () => {
    if (firstSplatfestSchedule) {
      setDisplay({
        title: t("splatfest_battle"),
        color: accentColor,
        schedules: festSchedules,
        select: ["festMatchSetting"],
      });
      setDisplaySchedules(true);
    }
  };
  const onRegularSchedulePress = () => {
    if (firstRegularSchedule) {
      setDisplay({
        title: t("regular_battle"),
        color: "green.500",
        schedules: regularSchedules,
        select: ["regularMatchSetting"],
      });
      setDisplaySchedules(true);
    }
  };
  const onAnarchySeriesSchedulePress = () => {
    if (firstAnarchySchedule) {
      setDisplay({
        title: t("anarchy_battle_series"),
        color: "orange.600",
        schedules: anarchySchedules,
        select: ["bankaraMatchSettings", 0],
      });
      setDisplaySchedules(true);
    }
  };
  const onAnarchyOpenSchedulePress = () => {
    if (firstAnarchySchedule) {
      setDisplay({
        title: t("anarchy_battle_open"),
        color: "orange.600",
        schedules: anarchySchedules,
        select: ["bankaraMatchSettings", 1],
      });
      setDisplaySchedules(true);
    }
  };
  const onXSchedulePress = () => {
    if (firstXSchedule) {
      setDisplay({
        title: t("x_battle"),
        color: "emerald.400",
        schedules: xSchedules,
        select: ["xMatchSetting"],
      });
      setDisplaySchedules(true);
    }
  };
  const onDisplayCurrentSplatfestClose = () => {
    setDisplayCurrentSplatfest(false);
  };
  const onDisplaySchedulesClose = () => {
    setDisplaySchedules(false);
  };

  return (
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator="false">
      <HStack space={2} px={4}>
        {currentSplatfest !== null && (
          <ScheduleButton
            color={accentColor}
            isLoaded={currentSplatfest}
            valid={isStarted(currentSplatfest)}
            title={t("VnNSdWxlLTU=")}
            stages={currentSplatfestStage}
            onPress={onCurrentSplatfestPress}
          />
        )}
        {firstSplatfestSchedule !== null && (
          <ScheduleButton
            color={accentColor}
            isLoaded={firstSplatfestSchedule}
            valid={isStarted(firstSplatfestSchedule)}
            title={getRule(firstSplatfestSchedule, ["festMatchSetting"])}
            stages={getStageTitles(firstSplatfestSchedule, ["festMatchSetting"])}
            onPress={onSplatfestSchedulePress}
          />
        )}
        {firstRegularSchedule !== null && (
          <ScheduleButton
            color="green.500"
            isLoaded={firstRegularSchedule}
            valid={isStarted(firstRegularSchedule)}
            title={getRule(firstRegularSchedule, ["regularMatchSetting"])}
            stages={getStageTitles(firstRegularSchedule, ["regularMatchSetting"])}
            onPress={onRegularSchedulePress}
          />
        )}
        {firstAnarchySchedule !== null && (
          <ScheduleButton
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, ["bankaraMatchSettings", 0])}
            stages={getStageTitles(firstAnarchySchedule, ["bankaraMatchSettings", 0])}
            onPress={onAnarchySeriesSchedulePress}
          />
        )}
        {firstAnarchySchedule !== null && (
          <ScheduleButton
            color="orange.600"
            isLoaded={firstAnarchySchedule}
            valid={isStarted(firstAnarchySchedule)}
            title={getRule(firstAnarchySchedule, ["bankaraMatchSettings", 1])}
            stages={getStageTitles(firstAnarchySchedule, ["bankaraMatchSettings", 1])}
            onPress={onAnarchyOpenSchedulePress}
          />
        )}
        {firstXSchedule !== null && (
          <ScheduleButton
            color="emerald.400"
            isLoaded={firstXSchedule}
            valid={isStarted(firstXSchedule)}
            title={getRule(firstXSchedule, ["xMatchSetting"])}
            stages={getStageTitles(firstXSchedule, ["xMatchSetting"])}
            onPress={onXSchedulePress}
          />
        )}
      </HStack>
      <Modal
        isOpen={displayCurrentSplatfest}
        onClose={onDisplayCurrentSplatfestClose}
        avoidKeyboard
        justifyContent="flex-end"
        safeArea
        size="xl"
      >
        <Modal.Content maxH="xl">
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <HStack space={2} alignItems="center">
                <CircleIcon size={3} color={display?.color} />
                <Text bold fontSize="md" color={display?.color} noOfLines={1}>
                  {display?.title}
                </Text>
              </HStack>
              {currentSplatfest && (
                <VStack flex={1} space={2} alignItems="center">
                  <ScheduleBox
                    rule={t("VnNSdWxlLTU=")}
                    time={getTimeRange(currentSplatfest, true)}
                    stages={[formatStage(currentSplatfest["tricolorStage"])]}
                  />
                </VStack>
              )}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={displaySchedules}
        onClose={onDisplaySchedulesClose}
        avoidKeyboard
        justifyContent="flex-end"
        safeArea
        size="xl"
      >
        <Modal.Content maxH="xl">
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <HStack space={2} alignItems="center">
                <CircleIcon size={3} color={display?.color} />
                <Text bold fontSize="md" color={display?.color} noOfLines={1}>
                  {display?.title}
                </Text>
              </HStack>
              {display?.schedules && (
                <VStack flex={1} space={2} alignItems="center">
                  {display.schedules
                    .filter((schedule) => getMatchSetting(schedule, display.select))
                    .map((schedule, i) => (
                      <ScheduleBox
                        key={i}
                        rule={getRule(schedule, display.select)}
                        time={getTimeRange(schedule)}
                        stages={getStages(schedule, display.select).map(formatStage)}
                      />
                    ))}
                </VStack>
              )}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
};

export default ScheduleView;
