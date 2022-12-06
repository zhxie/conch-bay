import dayjs from "dayjs";
import { CircleIcon, HStack, Modal, ScrollView, Text, VStack } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import { useState } from "react";
import { ScheduleBox, ScheduleButton, ShiftBox } from "../components";
import {
  AnarchyMatchSetting,
  Color,
  CoopWeapon,
  Splatfest,
  GraphQlResponse,
  RegularMatchSetting,
  Schedule,
  Schedules,
  Shift,
  SplatfestMatchSetting,
  VsStage,
  XMatchSetting,
} from "../models";

interface ScheduleViewProps {
  t: (str: string) => string;
  accentColor: ColorType;
  schedules?: GraphQlResponse<Schedules>;
}
interface DisplayProps {
  title: string;
  color: ColorType;
  splatfest?: Splatfest;
  schedules?: Schedule[];
  shifts?: Shift[];
  index?: number;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const { t } = props;

  const [display, setDisplay] = useState<DisplayProps | undefined>(undefined);
  const [displaySplatfest, setDisplaySplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);
  const [displayShifts, setDisplayShifts] = useState(false);

  const getMatchSetting = (schedule: Schedule, index?: number) => {
    const regularMatchSetting = schedule["regularMatchSetting"];
    if (regularMatchSetting !== undefined) {
      return regularMatchSetting as RegularMatchSetting | null;
    }
    const anarchyMatchSettings = schedule["bankaraMatchSettings"];
    if (anarchyMatchSettings !== undefined) {
      if (anarchyMatchSettings === null) {
        return null;
      }
      return (anarchyMatchSettings as AnarchyMatchSetting[])[index ?? 0];
    }
    const xMatchSetting = schedule["xMatchSetting"];
    if (xMatchSetting !== undefined) {
      return xMatchSetting as XMatchSetting | null;
    }
    const splatfestMatchSetting = schedule["festMatchSetting"];
    if (splatfestMatchSetting !== undefined) {
      return splatfestMatchSetting as SplatfestMatchSetting | null;
    }
    throw "unexpected match setting";
  };
  const getShiftSetting = (shift: Shift) => {
    return shift.setting;
  };
  const currentSplatfest = props.schedules?.data.currentFest?.tricolorStage
    ? props.schedules?.data.currentFest
    : undefined;
  const splatfestSchedules = props.schedules?.data.festSchedules.nodes.filter((schedule) =>
    getMatchSetting(schedule)
  );
  const regularSchedules = props.schedules?.data.regularSchedules.nodes.filter((schedule) =>
    getMatchSetting(schedule)
  );
  const anarchySchedules = props.schedules?.data.bankaraSchedules.nodes.filter((schedule) =>
    getMatchSetting(schedule)
  );
  const xSchedules = props.schedules?.data.xSchedules.nodes.filter((schedule) =>
    getMatchSetting(schedule)
  );
  const bigRunShifts = props.schedules?.data.coopGroupingSchedule.bigRunSchedules.nodes;
  const regularShifts = props.schedules?.data.coopGroupingSchedule.regularSchedules.nodes;

  const isStarted = (schedule: Schedule) => {
    const now = new Date().getTime();
    const date = new Date(schedule["startTime"]);
    const timestamp = date.getTime();
    return timestamp <= now;
  };
  const getRule = (schedule: Schedule, index?: number) => {
    const setting = getMatchSetting(schedule, index)!;
    return t(setting.vsRule.id);
  };
  const getSplatfestStage = (splatfest: Splatfest) => {
    return splatfest.tricolorStage!;
  };
  const getSplatfestStageTitle = (splatfest: Splatfest) => {
    const stage = getSplatfestStage(splatfest);
    return t(stage.id);
  };
  const getStages = (schedule: Schedule, index?: number) => {
    const setting = getMatchSetting(schedule, index)!;
    return setting.vsStages;
  };
  const getStageTitles = (schedule: Schedule, index?: number) => {
    const stages = getStages(schedule, index);
    let result: string[] = [];
    for (let stage of stages) {
      result.push(t(stage.id));
    }
    return result;
  };
  const getCoopStage = (shift: Shift) => {
    const setting = getShiftSetting(shift);
    return setting["coopStage"];
  };
  const getCoopStageTitle = (shift: Shift) => {
    const stage = getCoopStage(shift);
    return t(stage["id"]);
  };
  const getWeapons = (shift: Shift) => {
    const setting = getShiftSetting(shift);
    return setting.weapons;
  };
  const getTimeRange = (schedule: Schedule, withDate: boolean) => {
    let format = "HH:mm";
    if (withDate) {
      format = "M/DD HH:mm";
    }

    const startTime = dayjs(schedule.startTime).format(format);
    const endTime = dayjs(schedule.endTime).format(format);

    return `${startTime} - ${endTime}`;
  };
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
      color: props.accentColor,
      splatfest: currentSplatfest,
    });
    setDisplaySplatfest(true);
  };
  const onSplatfestSchedulePress = () => {
    setDisplay({
      title: t("splatfest_battle"),
      color: props.accentColor,
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
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator={false}>
      <HStack space={2} px={4}>
        {!props.schedules &&
          new Array(8).fill(0).map((_, i) => {
            return (
              <ScheduleButton
                key={i}
                color="primary"
                isLoaded={false}
                isValid={false}
                title=""
                stages={[]}
              />
            );
          })}
        {currentSplatfest && (
          <ScheduleButton
            color={props.accentColor}
            isLoaded={!!currentSplatfest}
            isValid={isStarted(currentSplatfest)}
            title={t("VnNSdWxlLTU=")}
            stages={[getSplatfestStageTitle(currentSplatfest)]}
            onPress={onCurrentSplatfestPress}
          />
        )}
        {splatfestSchedules?.at(0) && (
          <ScheduleButton
            color={props.accentColor}
            isLoaded={!!splatfestSchedules[0]}
            isValid={isStarted(splatfestSchedules[0])}
            title={getRule(splatfestSchedules[0])}
            stages={getStageTitles(splatfestSchedules[0])}
            onPress={onSplatfestSchedulePress}
          />
        )}
        {regularSchedules?.at(0) && (
          <ScheduleButton
            color={Color.RegularBattle}
            isLoaded={!!regularSchedules[0]}
            isValid={isStarted(regularSchedules[0])}
            title={getRule(regularSchedules[0])}
            stages={getStageTitles(regularSchedules[0])}
            onPress={onRegularSchedulePress}
          />
        )}
        {anarchySchedules?.at(0) && (
          <ScheduleButton
            color={Color.AnarchyBattle}
            isLoaded={!!anarchySchedules[0]}
            isValid={isStarted(anarchySchedules[0])}
            title={getRule(anarchySchedules[0], 0)}
            stages={getStageTitles(anarchySchedules[0], 1)}
            onPress={onAnarchySeriesSchedulePress}
          />
        )}
        {anarchySchedules?.at(0) && (
          <ScheduleButton
            color={Color.AnarchyBattle}
            isLoaded={!!anarchySchedules[0]}
            isValid={isStarted(anarchySchedules[0])}
            title={getRule(anarchySchedules[0], 1)}
            stages={getStageTitles(anarchySchedules[0], 1)}
            onPress={onAnarchyOpenSchedulePress}
          />
        )}
        {xSchedules?.at(0) && (
          <ScheduleButton
            color={Color.XBattle}
            isLoaded={!!xSchedules[0]}
            isValid={isStarted(xSchedules[0])}
            title={getRule(xSchedules[0])}
            stages={getStageTitles(xSchedules[0])}
            onPress={onXSchedulePress}
          />
        )}
        {bigRunShifts?.at(0) && (
          <ScheduleButton
            color={Color.BigRun}
            isLoaded={!!bigRunShifts[0]}
            isValid={isStarted(bigRunShifts[0])}
            title={t("big_run")}
            stages={[getCoopStageTitle(bigRunShifts[0])]}
            onPress={onBigRunShiftPress}
          />
        )}
        {regularShifts?.at(0) && (
          <ScheduleButton
            color={Color.SalmonRun}
            isLoaded={!!regularShifts[0]}
            isValid={isStarted(regularShifts[0])}
            title={t("salmon_run")}
            stages={[getCoopStageTitle(regularShifts[0])]}
            onPress={onRegularShiftPress}
          />
        )}
      </HStack>
      <Modal
        isOpen={displaySplatfest}
        onClose={onDisplaySplatfestClose}
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
              {display?.splatfest && (
                <VStack flex={1} space={2} alignItems="center">
                  <ScheduleBox
                    rule={t("VnNSdWxlLTU=")}
                    time={getTimeRange(display.splatfest, true)}
                    stages={[formatStage(getSplatfestStage(display.splatfest))]}
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
                    .filter((schedule) => getMatchSetting(schedule, display.index))
                    .map((schedule, i) => (
                      <ScheduleBox
                        key={i}
                        rule={getRule(schedule, display.index)}
                        time={getTimeRange(schedule, false)}
                        stages={getStages(schedule, display.index).map(formatStage)}
                      />
                    ))}
                </VStack>
              )}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={displayShifts}
        onClose={onDisplayShiftsClose}
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
              {display?.shifts && (
                <VStack flex={1} space={2} alignItems="center">
                  {display.shifts
                    .filter((shift) => getShiftSetting(shift))
                    .map((shift, i) => (
                      <ShiftBox
                        key={i}
                        rule={display.title}
                        time={getTimeRange(shift, true)}
                        stage={formatStage(getCoopStage(shift))}
                        weapons={getWeapons(shift).map(formatWeapon)}
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
