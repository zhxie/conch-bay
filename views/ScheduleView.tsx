import dayjs from "dayjs";
import "dayjs/plugin/advancedFormat";
import { useState } from "react";
import { Linking, ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Button,
  Color,
  GearBox,
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
} from "../components";
import t, { td } from "../i18n";
import {
  BankaraMatchSetting,
  CoopGroupingSchedule,
  CoopStage,
  CoopSupplyWeapon,
  CurrentFest,
  FestMatchSetting,
  RegularMatchSetting,
  Schedules,
  Shop,
  VsSchedule,
  VsStage,
  XMatchSetting,
} from "../models/types";
import { getGearPadding, getImageCacheSource } from "../utils/ui";

interface ScheduleViewProps {
  schedules?: Schedules;
  shop?: Shop;
  style?: StyleProp<ViewStyle>;
}
interface DisplayProps {
  title: string;
  color: string;
  splatfest?: CurrentFest;
  schedules?: VsSchedule[];
  shifts?: CoopGroupingSchedule[];
  index?: number;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const colorScheme = useColorScheme();
  const shopColor = colorScheme === "light" ? Color.LightText : Color.DarkText;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [display, setDisplay] = useState<DisplayProps>();
  const [displaySplatfest, setDisplaySplatfest] = useState(false);
  const [displaySchedules, setDisplaySchedules] = useState(false);
  const [displayShifts, setDisplayShifts] = useState(false);
  const [displayShop, setDisplayShop] = useState(false);

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

  const splatfestSchedules = props.schedules?.festSchedules.nodes.filter((node) =>
    getMatchSetting(node)
  );
  const currentSplatfest = props.schedules?.currentFest?.tricolorStage
    ? props.schedules.currentFest
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

  const isScheduleStarted = (schedule: VsSchedule | CoopGroupingSchedule) => {
    const now = new Date().getTime();
    const date = new Date(schedule.startTime);
    const timestamp = date.getTime();
    return timestamp <= now;
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
    schedule: VsSchedule | CoopGroupingSchedule,
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
  const onShopPress = () => {
    setDisplayShop(true);
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
  const onDisplayShopClose = () => {
    setDisplayShop(false);
  };
  const onOrderInNintendoSwitchOnlinePress = async () => {
    await Linking.openURL("com.nintendo.znca://znca/game/4834290508791808?p=/gesotown");
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack style={ViewStyles.px4}>
        {!props.schedules &&
          new Array(9)
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
        {bigRunShifts?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(bigRunShifts[0]) ? Color.BigRun : undefined}
            rule={t("big_run")}
            stages={[td(bigRunShifts[0].setting!.coopStage)]}
            onPress={onBigRunShiftPress}
            style={ViewStyles.mr2}
          />
        )}
        {regularShifts?.[0] && (
          <ScheduleButton
            color={isScheduleStarted(regularShifts[0]) ? Color.SalmonRun : undefined}
            rule={t("salmon_run")}
            stages={[td(regularShifts[0].setting!.coopStage)]}
            onPress={onRegularShiftPress}
            style={ViewStyles.mr2}
          />
        )}
        {props.shop && (
          <ScheduleButton
            color={shopColor}
            rule={t("gesotown")}
            stages={[t(props.shop.gesotown.pickupBrand.brand.id)].concat(
              props.shop.gesotown.limitedGears.length > 0
                ? [props.shop.gesotown.limitedGears[0].gear.name]
                : []
            )}
            onPress={onShopPress}
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
                  rule={td(getMatchSetting(schedule, display.index)!.vsRule)}
                  time={formatScheduleTimeRange(schedule, false)}
                  stages={getMatchSetting(schedule, display.index)!.vsStages.map(formatStage)}
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
      <Modal isVisible={displayShop} onClose={onDisplayShopClose} style={ViewStyles.modal2d}>
        <TitledList color={shopColor} title={t("gesotown")}>
          {props.shop && (
            <VStack center style={ViewStyles.mb2}>
              {props.shop.gesotown.pickupBrand.brandGears.map((gear, i, gears) => (
                <GearBox
                  key={gear.id}
                  isFirst={i === 0}
                  isLast={i === gears.length - 1}
                  image={getImageCacheSource(gear.gear.image.url)}
                  brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                  name={gear.gear.name}
                  brand={t(gear.gear.brand.id)}
                  primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                  additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                    getImageCacheSource(gearPower.image.url)
                  )}
                  paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
                />
              ))}
            </VStack>
          )}
          {props.shop && (
            <VStack center style={ViewStyles.mb2}>
              {props.shop.gesotown.limitedGears.map((gear, i, gears) => (
                <GearBox
                  key={gear.id}
                  isFirst={i === 0}
                  isLast={i === gears.length - 1}
                  image={getImageCacheSource(gear.gear.image.url)}
                  brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                  name={gear.gear.name}
                  brand={t(gear.gear.brand.id)}
                  primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                  additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                    getImageCacheSource(gearPower.image.url)
                  )}
                  paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
                />
              ))}
            </VStack>
          )}
          <VStack style={ViewStyles.wf}>
            <Button style={ViewStyles.accent} onPress={onOrderInNintendoSwitchOnlinePress}>
              <Marquee style={reverseTextColor}>{t("order_in_nintendo_switch_online")}</Marquee>
            </Button>
          </VStack>
        </TitledList>
      </Modal>
    </ScrollView>
  );
};

export default ScheduleView;
