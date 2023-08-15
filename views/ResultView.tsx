import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import JSONTree from "react-native-json-tree";
import {
  AccordionDisplay,
  BannerLevel,
  BattleButton,
  BattlePlayerButton,
  BattleWeaponBox,
  BossSalmonidBox,
  Button,
  Circle,
  Color,
  CoopButton,
  CoopPlayerButton,
  CoopWeaponBox,
  Display,
  GearBox,
  GroupButton,
  HStack,
  Image,
  KingSalmonidBox,
  Marquee,
  Modal,
  PureIconButton,
  Rectangle,
  Result,
  Splashtag,
  Text,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
  WaveBox,
  WorkSuitBox,
  useBanner,
  useTheme,
} from "../components";
import t, { ScopeWithDefaultValue, td } from "../i18n";
import {
  Award,
  AwardRank,
  Badge,
  CoopHistoryDetailResult,
  CoopMemberResult,
  CoopPlayerResult,
  CoopRule,
  CoopWaveResult,
  DragonMatchType,
  Enum,
  FestDragonCert,
  Judgement,
  Species,
  VsHistoryDetailResult,
  VsPlayer,
  VsTeam,
} from "../models/types";
import { countBattle, countCoop } from "../utils/stats";
import {
  getCoopRuleColor,
  getImageCacheSource,
  getColor,
  getVsModeColor,
  getVsSelfPlayer,
  getGearPadding,
  getVsPower,
  roundPower,
  getImageHash,
} from "../utils/ui";
import { StatsModal } from "./StatsView";

export interface ResultProps {
  battle?: VsHistoryDetailResult;
  coop?: CoopHistoryDetailResult;
}
export interface GroupProps {
  battles?: VsHistoryDetailResult[];
  coops?: CoopHistoryDetailResult[];
}
interface GroupAndResultProps extends ResultProps {
  group?: GroupProps;
}
interface ResultViewProps {
  groups?: GroupProps[];
  refreshControl: React.ReactElement<RefreshControlProps>;
  header: React.ReactElement;
  footer: React.ReactElement;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollToTop?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style?: StyleProp<ViewStyle>;
}

const ResultView = (props: ResultViewProps) => {
  const { height } = useWindowDimensions();
  // HACK: expect there is 480px occupied by other components.
  const placeholder = Math.ceil((height - 480) / 64);

  const theme = useTheme();

  const showBanner = useBanner();

  const [result, setResult] = useState<ResultProps>();
  const [group, setGroup] = useState<ResultProps[]>();
  const [displayResult, setDisplayResult] = useState(false);
  const [displayBattle, setDisplayBattle] = useState(false);
  const [battlePlayer, setBattlePlayer] = useState<VsPlayer>();
  const [displayBattlePlayer, setDisplayBattlePlayer] = useState(false);
  const [displayCoop, setDisplayCoop] = useState(false);
  const [coopPlayer, setCoopPlayer] = useState<CoopPlayerResult>();
  const [displayCoopPlayer, setDisplayCoopPlayer] = useState(false);
  const willDisplayNext = useRef<number>();
  const [hidePlayerNames, setHidePlayerNames] = useState(false);
  const [displayGroup, setDisplayGroup] = useState(false);
  const [dimension, setDimension] = useState(0);

  const results = useMemo(() => {
    if (!props.groups) {
      return undefined;
    }
    const results: ResultProps[] = [];
    for (const group of props.groups) {
      if (group.battles) {
        results.push(...group.battles!.map((battle) => ({ battle: battle })));
      } else {
        results.push(...group.coops!.map((coop) => ({ coop: coop })));
      }
    }
    return results;
  }, [props.groups]);
  const groupsAndResults = useMemo(() => {
    if (!props.groups) {
      return undefined;
    }
    const results: GroupAndResultProps[] = [];
    for (const group of props.groups) {
      results.push({ group: group });
      if (group.battles) {
        results.push(...group.battles!.map((battle) => ({ battle: battle })));
      } else {
        results.push(...group.coops!.map((coop) => ({ coop: coop })));
      }
    }
    return results;
  }, [props.groups]);
  const stats = useMemo(() => {
    if (!group) {
      return undefined;
    }
    return group.map((result) => {
      if (result.battle) {
        return { battle: countBattle(result.battle) };
      }
      return { coop: countCoop(result.coop!) };
    });
  }, [group]);

  const findIndex = () => {
    const id = result?.battle?.vsHistoryDetail?.id || result?.coop?.coopHistoryDetail?.id;
    if (id) {
      return results?.findIndex(
        (result) =>
          result.battle?.vsHistoryDetail?.id === id || result.coop?.coopHistoryDetail?.id === id
      );
    }
  };
  const i = useMemo(() => {
    const j = findIndex();
    if (j === undefined) {
      return undefined;
    }
    return j >= 0 ? j : undefined;
  }, [results, result]);

  const isVsPlayerDragon = (player: VsPlayer) => {
    switch (player.festDragonCert as FestDragonCert) {
      case FestDragonCert.NONE:
        return false;
      case FestDragonCert.DRAGON:
      case FestDragonCert.DOUBLE_DRAGON:
        return true;
    }
  };
  const isCoopClear = (coop: CoopHistoryDetailResult) => {
    if (coop.coopHistoryDetail!.resultWave === 0) {
      if (coop.coopHistoryDetail!.bossResult) {
        return coop.coopHistoryDetail!.bossResult.hasDefeatBoss;
      }
      return true;
    }
    return false;
  };
  const isCoopWaveClear = (coop: CoopHistoryDetailResult, wave: number) => {
    if (coop.coopHistoryDetail!.resultWave === 0) {
      if (!coop.coopHistoryDetail!.waveResults[wave].deliverNorm) {
        return coop.coopHistoryDetail!.bossResult!.hasDefeatBoss;
      }
      return true;
    }
    return wave + 1 < coop.coopHistoryDetail!.resultWave;
  };
  const isCoopSpecialWeaponPadding = (coop: CoopHistoryDetailResult) => {
    return (
      coop.coopHistoryDetail!.waveResults.filter(
        (waveResult) => waveResult.specialWeapons.length > 0
      ).length > 0
    );
  };

  const formatJudgement = (battle: VsHistoryDetailResult) => {
    switch (battle.vsHistoryDetail!.judgement as Judgement) {
      case Judgement.WIN:
        return Result.Win;
      case Judgement.DRAW:
        return Result.Draw;
      case Judgement.LOSE:
      case Judgement.DEEMED_LOSE:
        return Result.Lose;
      case Judgement.EXEMPTED_LOSE:
        return Result.ExemptedLose;
    }
  };
  const formatDragon = (battle: VsHistoryDetailResult) => {
    if (battle.vsHistoryDetail!.festMatch) {
      switch (battle.vsHistoryDetail!.festMatch.dragonMatchType as DragonMatchType) {
        case DragonMatchType.NORMAL:
          return undefined;
        case DragonMatchType.DECUPLE:
          return t("n_x_battle", { n: 10 });
        case DragonMatchType.DRAGON:
          return t("n_x_battle", { n: 100 });
        case DragonMatchType.DOUBLE_DRAGON:
          return t("n_x_battle", { n: 333 });
      }
    }
  };
  const formatPower = (power: number | null | undefined) => {
    if (power === null || power === undefined) {
      return undefined;
    }
    return roundPower(power);
  };
  const formatName = (name: string, species: Enum<typeof Species>, isSelf: boolean) => {
    if (hidePlayerNames && !isSelf) {
      switch (species as Species) {
        case Species.INKLING:
          return "ᔦꙬᔨ三ᔦꙬᔨ✧‧˚";
        case Species.OCTOLING:
          return "( Ꙭ )三( Ꙭ )✧‧˚";
      }
    }
    return name;
  };
  const formatBadge = (badge: Badge | null) => {
    if (badge) {
      return getImageCacheSource(badge.image.url);
    }
    return null;
  };
  const formatPlayedTime = (playedTime: string) => {
    return dayjs(playedTime).format("YYYY/M/D HH:mm:ss");
  };
  const formatDuration = (duration: number) => {
    return dayjs.duration(duration, "second").format("m:ss");
  };
  const formatMedalColor = (medal: Award) => {
    switch (medal.rank as AwardRank) {
      case AwardRank.GOLD:
        return Color.GoldScale;
      case AwardRank.SILVER:
        return Color.SilverScale;
    }
  };
  const formatHazardLevel = (coop: CoopHistoryDetailResult) => {
    if (coop.coopHistoryDetail!.dangerRate > 0) {
      return `${parseInt(String(coop.coopHistoryDetail!.dangerRate * 100))}%`;
    }
    return "";
  };
  const formatCoopInfo = (coop: CoopHistoryDetailResult) => {
    if (coop.coopHistoryDetail!.afterGrade) {
      return `${td(coop.coopHistoryDetail!.afterGrade)} ${
        coop.coopHistoryDetail!.afterGradePoint || 0
      }`;
    }
    switch (coop.coopHistoryDetail!.resultWave) {
      case -1:
        return "";
      case 0:
        if (coop.coopHistoryDetail!.bossResult) {
          return t("xtrawave");
        }
        return t("wave_n", { n: coop.coopHistoryDetail!.waveResults.length });
      default:
        return t("wave_n", { n: coop.coopHistoryDetail!.waveResults.length });
    }
  };
  const formatGradeChange = (coop: CoopHistoryDetailResult) => {
    switch (coop.coopHistoryDetail!.rule as CoopRule) {
      case CoopRule.REGULAR:
      case CoopRule.BIG_RUN:
        switch (coop.coopHistoryDetail!.resultWave) {
          case 0:
            return Result.Win;
          default:
            if (coop.coopHistoryDetail!.resultWave < 3) {
              return Result.Lose;
            }
            return Result.Draw;
        }
      case CoopRule.TEAM_CONTEST:
        return undefined;
    }
  };
  const formatGroupPeriod = (start: string, end: string) => {
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
  const formatAnnotation = (battle: VsHistoryDetailResult) => {
    switch (battle.vsHistoryDetail!.judgement as Judgement) {
      case Judgement.WIN:
      case Judgement.LOSE:
        return undefined;
      case Judgement.DEEMED_LOSE:
        return t("penalty");
      case Judgement.EXEMPTED_LOSE:
        return t("exemption");
      case Judgement.DRAW:
        return t("no_contest");
    }
  };
  const formatTeams = (battle: VsHistoryDetailResult) => {
    const teams = [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams];
    teams.sort((a, b) => {
      if (a.judgement === "WIN" && b.judgement === "LOSE") {
        return -1;
      }
      if (a.judgement === "LOSE" && b.judgement === "WIN") {
        return 1;
      }
      if (a.result === null) {
        return 0;
      }
      if (a.result.paintRatio !== null) {
        return b.result!.paintRatio! - a.result.paintRatio;
      }
      return b.result!.score! - a.result.score!;
    });
    return teams;
  };
  const formatTeamName = (team: VsTeam) => {
    const parts: string[] = [];
    if (team.festTeamName) {
      parts.push(team.festTeamName);
    }
    if ((team["festStreakWinCount"] ?? 0) > 1) {
      parts.push(t("n_win_strike", { n: team["festStreakWinCount"] }));
    }
    if (team["festUniformName"]) {
      parts.push(team["festUniformName"]);
    }
    return parts.join(" ");
  };
  const formatTeamResult = (team: VsTeam) => {
    if (team.result) {
      if (team.result.paintRatio) {
        return `${(team.result.paintRatio * 100).toFixed(1)}%`;
      } else {
        if (team.result.score === 100) {
          return t("knock_out");
        } else {
          return t("score_score", { score: team.result.score });
        }
      }
    }
    return " ";
  };
  const formatRankPoints = (point: number) => {
    if (point > 0) {
      return `+${point}p`;
    }
    return `${point}p`;
  };
  const formatWaterLevel = (waveResult: CoopWaveResult) => {
    switch (waveResult.waterLevel) {
      case 0:
        return t("low_tide");
      case 1:
        return t("normal");
      case 2:
        return t("high_tide");
    }
  };
  const formatEventWave = (waveResult: CoopWaveResult) => {
    if (!waveResult.eventWave) {
      return "";
    }
    return td(waveResult.eventWave);
  };
  const formatWaveSpecialWeapons = (coop: CoopHistoryDetailResult, waveResult: CoopWaveResult) => {
    const orderMap = new Map<string, number>();
    [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
      .map((memberResult) => memberResult.specialWeapon)
      .filter((specialWeapon) => specialWeapon)
      .forEach((specialWeapon, i) => orderMap.set(specialWeapon!.image.url, i));
    const result = waveResult.specialWeapons.map((specialWeapon) => specialWeapon.image.url);
    result.sort((a, b) => orderMap.get(a)! - orderMap.get(b)!);
    return result.map((image) => getImageCacheSource(image));
  };
  const formatScenarioCode = (scenarioCode: string) => {
    const result: string[] = [];
    for (let i = 0; i < scenarioCode.length; i += 4) {
      result.push(scenarioCode.substring(i, i + 4));
    }
    return result.join("-");
  };

  const onDisplayResultClose = () => {
    setDisplayResult(false);
  };
  const onDisplayBattleClose = () => {
    setDisplayBattle(false);
  };
  const onDisplayBattlePlayerClose = () => {
    setDisplayBattlePlayer(false);
  };
  const onDisplayCoopClose = () => {
    setDisplayCoop(false);
  };
  const onDisplayCoopPlayerClose = () => {
    setDisplayCoopPlayer(false);
  };
  const onShowNextResultPress = () => {
    if (i !== undefined && i - 1 >= 0) {
      if ((displayBattle && results![i - 1].battle) || (displayCoop && results![i - 1].coop)) {
        setResult(results![i - 1]);
        return;
      }
      willDisplayNext.current = i - 1;
    }
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onShowPreviousResultPress = () => {
    if (i !== undefined && i + 1 < results!.length) {
      if ((displayBattle && results![i + 1].battle) || (displayCoop && results![i + 1].coop)) {
        setResult(results![i + 1]);
        return;
      }
      willDisplayNext.current = i + 1;
    }
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onHidePlayerNamesPress = () => {
    setHidePlayerNames(!hidePlayerNames);
  };
  const onShowRawResultPress = () => {
    willDisplayNext.current = -1;
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onOpenInNintendoSwitchOnlinePress = () => {
    if (result!.battle) {
      Linking.openURL(
        `com.nintendo.znca://znca/game/4834290508791808?p=/history/detail/${
          result!.battle.vsHistoryDetail!.id
        }`
      );
    } else {
      Linking.openURL(
        `com.nintendo.znca://znca/game/4834290508791808?p=/coop/${
          result!.coop!.coopHistoryDetail!.id
        }`
      );
    }
  };
  const onCopyRawValue = async (value: any) => {
    await Clipboard.setStringAsync(value.toString());
    showBanner(BannerLevel.Info, t("copied_to_clipboard"));
  };
  const onModalHide = () => {
    if (willDisplayNext.current !== undefined) {
      if (willDisplayNext.current < 0) {
        setDisplayResult(true);
      } else {
        if (results?.[willDisplayNext.current].battle) {
          setResult({ battle: results![willDisplayNext.current].battle });
          setDisplayBattle(true);
        } else if (results?.[willDisplayNext.current].coop) {
          setResult({ coop: results![willDisplayNext.current].coop });
          setDisplayCoop(true);
        }
      }
      willDisplayNext.current = undefined;
    }
  };
  const onDisplayGroupClose = () => {
    setDisplayGroup(false);
  };
  const onDimensionChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setDimension(event.nativeEvent.selectedSegmentIndex);
  };

  const onBattlePress = useCallback((battle: VsHistoryDetailResult) => {
    setResult({ battle });
    setDisplayBattle(true);
  }, []);
  const onCoopPress = useCallback((coop: CoopHistoryDetailResult) => {
    setResult({ coop });
    setDisplayCoop(true);
  }, []);
  const onGroupPress = useCallback((group: GroupProps) => {
    const results: ResultProps[] = [];
    for (const battle of group.battles ?? []) {
      results.push({ battle });
    }
    for (const coop of group.coops ?? []) {
      results.push({ coop });
    }
    setGroup(results);
    setDisplayGroup(true);
  }, []);

  const renderItem = (result: ListRenderItemInfo<GroupAndResultProps>) => {
    if (result.item.battle) {
      const color = getVsModeColor(result.item.battle.vsHistoryDetail!.vsMode)!;
      return (
        <VStack flex style={ViewStyles.px4}>
          <BattleButton
            battle={(result.item as GroupAndResultProps).battle}
            first={false}
            last={
              groupsAndResults!.length > result.index + 1 &&
              groupsAndResults![result.index + 1].group !== undefined
            }
            tag={
              result.extraData?.battle?.vsHistoryDetail?.id ===
              result.item.battle.vsHistoryDetail!.id
                ? color
                : undefined
            }
            color={color}
            result={formatJudgement(result.item.battle)}
            rule={td(result.item.battle.vsHistoryDetail!.vsRule)}
            dragon={formatDragon(result.item.battle)}
            stage={td(result.item.battle.vsHistoryDetail!.vsStage)}
            weapon={td(getVsSelfPlayer(result.item.battle).weapon)}
            power={formatPower(getVsPower(result.item.battle))}
            kill={getVsSelfPlayer(result.item.battle).result?.kill}
            assist={getVsSelfPlayer(result.item.battle).result?.assist}
            death={getVsSelfPlayer(result.item.battle).result?.death}
            special={getVsSelfPlayer(result.item.battle).result?.special}
            ultraSignal={
              result.item.battle.vsHistoryDetail!.myTeam.tricolorRole !== "DEFENSE"
                ? getVsSelfPlayer(result.item.battle).result?.noroshiTry
                : undefined
            }
            onPress={onBattlePress}
          />
        </VStack>
      );
    }
    if (result.item.coop) {
      const color = getCoopRuleColor(result.item.coop.coopHistoryDetail!.rule)!;
      const powerEgg =
        // HACK: cast out union uncertainty.
        (result.item.coop.coopHistoryDetail!.memberResults as CoopMemberResult[]).reduce(
          (sum, result) => sum + result.deliverCount,
          result.item.coop.coopHistoryDetail!.myResult.deliverCount
        );
      const goldenEgg = result.item.coop.coopHistoryDetail!.waveResults.reduce(
        (sum, result) => sum + (result.teamDeliverCount ?? 0),
        0
      );
      return (
        <VStack flex style={ViewStyles.px4}>
          <CoopButton
            coop={(result.item as GroupAndResultProps).coop}
            first={false}
            last={
              groupsAndResults!.length > result.index + 1 &&
              groupsAndResults![result.index + 1].group !== undefined
            }
            tag={
              result.extraData?.coop?.coopHistoryDetail?.id ===
              result.item.coop.coopHistoryDetail!.id
                ? color
                : undefined
            }
            color={color}
            result={result.item.coop.coopHistoryDetail!.resultWave === 0 ? Result.Win : Result.Lose}
            rule={t(result.item.coop.coopHistoryDetail!.rule)}
            stage={td(result.item.coop.coopHistoryDetail!.coopStage)}
            kingSalmonid={
              result.item.coop.coopHistoryDetail!.bossResult
                ? td(result.item.coop.coopHistoryDetail!.bossResult.boss)
                : undefined
            }
            isClear={isCoopClear(result.item.coop)}
            hazardLevel={formatHazardLevel(result.item.coop)}
            info={formatCoopInfo(result.item.coop)}
            gradeChange={formatGradeChange(result.item.coop)}
            powerEgg={powerEgg}
            goldenEgg={goldenEgg}
            onPress={onCoopPress}
          />
        </VStack>
      );
    }
    let mode = "";
    let period = "";
    if (result.item.group!.battles) {
      mode = result.item.group!.battles[0].vsHistoryDetail!.vsMode.id;
      period = formatGroupPeriod(
        result.item.group!.battles[result.item.group!.battles.length - 1].vsHistoryDetail!
          .playedTime,
        result.item.group!.battles[0].vsHistoryDetail!.playedTime
      );
    } else {
      mode = result.item.group!.coops![0].coopHistoryDetail!.rule;
      period = formatGroupPeriod(
        result.item.group!.coops![result.item.group!.coops!.length - 1].coopHistoryDetail!
          .playedTime,
        result.item.group!.coops![0].coopHistoryDetail!.playedTime
      );
    }
    return (
      <VStack flex style={ViewStyles.px4}>
        <GroupButton
          group={(result.item as GroupAndResultProps).group}
          first={true}
          last={false}
          title={t(mode)}
          subtitle={period}
          onPress={onGroupPress}
          style={result.index !== 0 && { marginTop: 8 }}
        />
      </VStack>
    );
  };

  return (
    <VStack flex>
      <FlashList
        refreshControl={props.refreshControl}
        data={groupsAndResults}
        keyExtractor={(groupAndResult) => {
          if (groupAndResult.battle) {
            return groupAndResult.battle.vsHistoryDetail!.id;
          }
          if (groupAndResult.coop) {
            return groupAndResult.coop!.coopHistoryDetail!.id;
          }
          if (groupAndResult.group!.battles) {
            return `${groupAndResult.group!.battles[0].vsHistoryDetail!.id}-${
              groupAndResult.group!.battles.length
            }`;
          }
          return `${groupAndResult.group!.coops![0].coopHistoryDetail!.id}-${
            groupAndResult.group!.coops!.length
          }`;
        }}
        renderItem={renderItem}
        extraData={result}
        // HACK: use the smaller one.
        estimatedItemSize={32}
        ListEmptyComponent={
          <VStack flex style={ViewStyles.px4}>
            {new Array(placeholder).fill(0).map((_, i) => (
              <BattleButton
                key={i}
                loading={true}
                first={i === 0}
                color={Color.MiddleTerritory}
                rule=""
                stage=""
                weapon=""
              />
            ))}
          </VStack>
        }
        ListHeaderComponent={props.header}
        ListFooterComponent={props.footer}
        onScroll={props.onScroll}
        onScrollBeginDrag={props.onScrollBeginDrag}
        onScrollEndDrag={props.onScrollEndDrag}
        onScrollToTop={props.onScrollToTop}
        onMomentumScrollBegin={props.onMomentumScrollBegin}
        onMomentumScrollEnd={props.onMomentumScrollEnd}
        scrollEventThrottle={16}
      />
      <Modal
        isVisible={displayResult}
        onClose={onDisplayResultClose}
        style={[
          ViewStyles.modal2f,
          {
            backgroundColor: "#272822",
          },
        ]}
      >
        {result && (
          <JSONTree
            theme="monokai"
            invertTheme={false}
            data={result.battle?.vsHistoryDetail ?? result.coop!.coopHistoryDetail}
            hideRoot
            onValuePress={onCopyRawValue}
          />
        )}
      </Modal>
      <Modal
        isVisible={displayBattle}
        onClose={onDisplayBattleClose}
        onModalHide={onModalHide}
        style={ViewStyles.modal3d}
      >
        {result?.battle && (
          <>
            <TitledList
              color={getVsModeColor(result.battle.vsHistoryDetail!.vsMode)}
              title={t(result.battle.vsHistoryDetail!.vsMode.id)}
              subtitle={formatAnnotation(result.battle)}
            >
              <VStack style={ViewStyles.wf}>
                {formatTeams(result.battle).map((team, i) => (
                  <VStack key={i} style={ViewStyles.mb2}>
                    <HStack center justify style={ViewStyles.mb1}>
                      <HStack flex center style={ViewStyles.mr1}>
                        <Circle size={12} color={getColor(team.color)} style={ViewStyles.mr1} />
                        <HStack flex>
                          <Marquee style={[TextStyles.b, { color: getColor(team.color) }]}>
                            {formatTeamName(team)}
                          </Marquee>
                        </HStack>
                      </HStack>
                      <HStack center>
                        {!!team.result?.noroshi &&
                          new Array(team.result.noroshi)
                            .fill(0)
                            .map((_, i) => (
                              <Circle
                                key={i}
                                size={10}
                                color={getColor(team.color)}
                                style={ViewStyles.mr1}
                              />
                            ))}
                        <Text
                          numberOfLines={1}
                          style={[TextStyles.b, { color: getColor(team.color) }]}
                        >
                          {formatTeamResult(team)}
                        </Text>
                      </HStack>
                    </HStack>
                    {team.players.map((player: VsPlayer, i: number, players: VsPlayer[]) => (
                      <BattlePlayerButton
                        key={i}
                        first={i === 0}
                        last={i === players.length - 1}
                        team={getColor(team.color)}
                        self={player.isMyself}
                        name={formatName(player.name, player.species, player.isMyself)}
                        weapon={getImageCacheSource(player.weapon.image2d.url)}
                        subWeapon={getImageCacheSource(player.weapon.subWeapon.image.url)}
                        specialWeapon={getImageCacheSource(player.weapon.specialWeapon.image.url)}
                        paint={player.paint}
                        kill={player.result?.kill}
                        assist={player.result?.assist}
                        death={player.result?.death}
                        special={player.result?.special}
                        ultraSignal={
                          team.tricolorRole !== "DEFENSE" ? player.result?.noroshiTry : undefined
                        }
                        crown={player.crown}
                        dragon={isVsPlayerDragon(player) ? getColor(team.color) : undefined}
                        onPress={() => {
                          setBattlePlayer(player);
                          setDisplayBattlePlayer(true);
                        }}
                      />
                    ))}
                  </VStack>
                ))}
                <VStack style={ViewStyles.mb2}>
                  <AccordionDisplay
                    first
                    last
                    title={t("details")}
                    subChildren={
                      <VStack>
                        <Display level={1} title={t("rule")}>
                          <Text numberOfLines={1}>
                            {`${td(result.battle.vsHistoryDetail!.vsRule)}`}
                          </Text>
                        </Display>
                        <Display level={1} title={t("stage")}>
                          <Text numberOfLines={1}>
                            {`${td(result.battle.vsHistoryDetail!.vsStage)}`}
                          </Text>
                        </Display>
                        {result.battle.vsHistoryDetail!.bankaraMatch &&
                          result.battle.vsHistoryDetail!.bankaraMatch.earnedUdemaePoint !==
                            null && (
                            <Display level={1} title={t("rank_points")}>
                              <Text numberOfLines={1}>
                                {formatRankPoints(
                                  result.battle.vsHistoryDetail!.bankaraMatch.earnedUdemaePoint
                                )}
                              </Text>
                            </Display>
                          )}
                        {result.battle.vsHistoryDetail!.bankaraMatch &&
                          result.battle.vsHistoryDetail!.bankaraMatch["bankaraPower"] &&
                          result.battle.vsHistoryDetail!.bankaraMatch["bankaraPower"]["power"] !==
                            undefined &&
                          result.battle.vsHistoryDetail!.bankaraMatch["bankaraPower"]["power"] !==
                            null && (
                            <Display level={1} title={t("anarchy_power")}>
                              <Text numberOfLines={1}>
                                {roundPower(
                                  result.battle.vsHistoryDetail!.bankaraMatch["bankaraPower"][
                                    "power"
                                  ]
                                )}
                              </Text>
                            </Display>
                          )}
                        {result.battle.vsHistoryDetail!.xMatch &&
                          result.battle.vsHistoryDetail!.xMatch.lastXPower !== null && (
                            <Display level={1} title={t("x_power")}>
                              <Text numberOfLines={1}>
                                {`${roundPower(result.battle.vsHistoryDetail!.xMatch.lastXPower)}`}
                              </Text>
                            </Display>
                          )}
                        {result.battle.vsHistoryDetail!.leagueMatch && (
                          <VStack>
                            {result.battle.vsHistoryDetail!.leagueMatch.leagueMatchEvent && (
                              <Display level={1} title={t("challenge_e")}>
                                <Text numberOfLines={1}>
                                  {td(result.battle.vsHistoryDetail!.leagueMatch.leagueMatchEvent)}
                                </Text>
                              </Display>
                            )}
                            {result.battle.vsHistoryDetail!.leagueMatch["myLeaguePower"] !==
                              undefined &&
                              result.battle.vsHistoryDetail!.leagueMatch["myLeaguePower"] !=
                                null && (
                                <Display level={1} title={t("challenge_power")}>
                                  <Text numberOfLines={1}>
                                    {`${roundPower(
                                      result.battle.vsHistoryDetail!.leagueMatch["myLeaguePower"]
                                    )}`}
                                  </Text>
                                </Display>
                              )}
                          </VStack>
                        )}
                        {result.battle.vsHistoryDetail!.festMatch && (
                          <VStack>
                            <Display level={1} title={t("clout")}>
                              <Text numberOfLines={1}>
                                {`${result.battle.vsHistoryDetail!.festMatch.contribution}`}
                              </Text>
                            </Display>
                            <Display level={1} title={t("festival_shell")}>
                              <Text numberOfLines={1}>
                                {`${result.battle.vsHistoryDetail!.festMatch.jewel}`}
                              </Text>
                            </Display>
                            {result.battle.vsHistoryDetail!.festMatch.myFestPower !== null && (
                              <Display level={1} title={t("splatfest_power")}>
                                <Text numberOfLines={1}>
                                  {`${result.battle.vsHistoryDetail!.festMatch.myFestPower.toFixed(
                                    1
                                  )}`}
                                </Text>
                              </Display>
                            )}
                          </VStack>
                        )}
                        {result.battle.vsHistoryDetail!.awards.map((award, i) => (
                          <Display key={i} level={1} title={i === 0 ? t("medals_earned") : ""}>
                            <HStack center>
                              <Circle
                                size={12}
                                color={formatMedalColor(award)}
                                style={ViewStyles.mr1}
                              />
                              <Text numberOfLines={1}>{award.name}</Text>
                            </HStack>
                          </Display>
                        ))}
                        <Display last level={1} title={t("played_time")}>
                          <Text numberOfLines={1}>
                            {formatPlayedTime(result.battle.vsHistoryDetail!.playedTime)}
                            <Text numberOfLines={1} style={TextStyles.h6}>
                              {`+${formatDuration(result.battle.vsHistoryDetail!.duration)}`}
                            </Text>
                          </Text>
                        </Display>
                      </VStack>
                    }
                  />
                </VStack>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  onPress={onHidePlayerNamesPress}
                >
                  <Marquee style={theme.reverseTextStyle}>
                    {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                  </Marquee>
                </Button>
                <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShowRawResultPress}>
                  <Marquee style={theme.reverseTextStyle}>{t("show_raw_data")}</Marquee>
                </Button>
                <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                  <Marquee style={theme.reverseTextStyle}>
                    {t("open_in_nintendo_switch_online")}
                  </Marquee>
                </Button>
              </VStack>
              <Modal
                isVisible={displayBattlePlayer}
                onClose={onDisplayBattlePlayerClose}
                style={ViewStyles.modal1d}
              >
                {battlePlayer && (
                  <VStack center>
                    <Splashtag
                      color={getColor(battlePlayer.nameplate!.background.textColor)}
                      name={battlePlayer.name}
                      nameId={battlePlayer.nameId}
                      // TODO: need translation.
                      title={battlePlayer.byname}
                      banner={getImageCacheSource(battlePlayer.nameplate!.background.image.url)}
                      badges={battlePlayer.nameplate!.badges.map(formatBadge)}
                      style={ViewStyles.mb2}
                    />
                    <BattleWeaponBox
                      image={getImageCacheSource(battlePlayer.weapon.image2d.url)}
                      name={td(battlePlayer.weapon)}
                      subWeapon={getImageCacheSource(battlePlayer.weapon.subWeapon.image.url)}
                      specialWeapon={getImageCacheSource(
                        battlePlayer.weapon.specialWeapon.image.url
                      )}
                      style={ViewStyles.mb2}
                    />
                    {[battlePlayer.headGear, battlePlayer.clothingGear, battlePlayer.shoesGear].map(
                      (gear, i, gears) => (
                        // TODO: show brands with its favorite.
                        <GearBox
                          key={i}
                          first={i === 0}
                          last={i === gears.length - 1}
                          image={getImageCacheSource(gear.originalImage.url)}
                          brandImage={getImageCacheSource(gear.brand.image.url)}
                          name={t(getImageHash(gear.originalImage.url), {
                            defaultValue: gear.name,
                          })}
                          brand={t(gear.brand.id)}
                          primaryAbility={getImageCacheSource(gear.primaryGearPower.image.url)}
                          additionalAbility={gear.additionalGearPowers.map((gearPower) =>
                            getImageCacheSource(gearPower.image.url)
                          )}
                          paddingTo={getGearPadding([
                            battlePlayer.headGear,
                            battlePlayer.clothingGear,
                            battlePlayer.shoesGear,
                          ])}
                        />
                      )
                    )}
                  </VStack>
                )}
              </Modal>
            </TitledList>
            {i !== undefined && (
              <PureIconButton
                disabled={i === 0}
                size={24}
                icon="chevron-left"
                hitSlop={8}
                style={{ position: "absolute", top: 14, marginLeft: -4 }}
                onPress={onShowNextResultPress}
              />
            )}
            {i !== undefined && (
              <PureIconButton
                disabled={i === (results?.length ?? 1) - 1}
                size={24}
                icon="chevron-right"
                hitSlop={8}
                style={{ position: "absolute", top: 14, right: 0, marginRight: -4 }}
                onPress={onShowPreviousResultPress}
              />
            )}
          </>
        )}
      </Modal>
      <Modal
        isVisible={displayCoop}
        onClose={onDisplayCoopClose}
        onModalHide={onModalHide}
        style={[ViewStyles.modal3d, { paddingHorizontal: 0 }]}
      >
        {result?.coop && (
          <>
            <TitledList
              color={getCoopRuleColor(result.coop.coopHistoryDetail!.rule)}
              title={t(result.coop.coopHistoryDetail!.rule)}
              subtitle={result.coop.coopHistoryDetail!.resultWave === -1 ? t("penalty") : undefined}
            >
              <VStack style={ViewStyles.wf}>
                <VStack style={ViewStyles.mb2}>
                  {result.coop.coopHistoryDetail!.waveResults.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={ViewStyles.mb2}
                    >
                      <HStack center style={ViewStyles.px4}>
                        {result.coop.coopHistoryDetail!.waveResults.map(
                          (waveResult, i, waveResults) => (
                            <WaveBox
                              key={i}
                              color={
                                isCoopWaveClear(result.coop!, i)
                                  ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)!
                                  : undefined
                              }
                              isKingSalmonid={!waveResult.deliverNorm}
                              waterLevel={formatWaterLevel(waveResult)!}
                              eventWave={
                                waveResult.deliverNorm
                                  ? formatEventWave(waveResult)
                                  : td(result.coop!.coopHistoryDetail!.bossResult!.boss)
                              }
                              deliver={
                                waveResult.teamDeliverCount ??
                                (result.coop!.coopHistoryDetail!.bossResult!.hasDefeatBoss ? 1 : 0)
                              }
                              quota={waveResult.deliverNorm ?? 1}
                              appearance={waveResult.goldenPopCount}
                              specialWeapons={formatWaveSpecialWeapons(result.coop!, waveResult)}
                              specialWeaponPadding={isCoopSpecialWeaponPadding(result.coop!)}
                              style={i !== waveResults.length - 1 ? ViewStyles.mr2 : undefined}
                            />
                          )
                        )}
                      </HStack>
                    </ScrollView>
                  )}
                  {(result.coop.coopHistoryDetail!.enemyResults.length > 0 ||
                    result.coop.coopHistoryDetail!.bossResult !== null) && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={ViewStyles.mb2}
                    >
                      <HStack center style={ViewStyles.px4}>
                        {result.coop.coopHistoryDetail!.bossResult !== null && (
                          <KingSalmonidBox
                            color={
                              result.coop.coopHistoryDetail!.bossResult.hasDefeatBoss
                                ? getCoopRuleColor(result.coop.coopHistoryDetail!.rule)!
                                : undefined
                            }
                            name={td(
                              result.coop.coopHistoryDetail!.bossResult
                                .boss as ScopeWithDefaultValue
                            )}
                            bronzeScale={result.coop.coopHistoryDetail!.scale!.bronze}
                            silverScale={result.coop.coopHistoryDetail!.scale!.silver}
                            goldScale={result.coop.coopHistoryDetail!.scale!.gold}
                            style={
                              result.coop.coopHistoryDetail!.enemyResults.length > 0
                                ? ViewStyles.mr2
                                : undefined
                            }
                          />
                        )}
                        {result.coop.coopHistoryDetail!.enemyResults.map(
                          (enemyResult, i, enemyResults) => (
                            <BossSalmonidBox
                              key={i}
                              color={
                                enemyResult.teamDefeatCount === enemyResult.popCount
                                  ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)!
                                  : undefined
                              }
                              name={td(enemyResult.enemy)}
                              defeat={enemyResult.defeatCount}
                              teamDefeat={enemyResult.teamDefeatCount}
                              appearance={enemyResult.popCount}
                              style={i !== enemyResults.length - 1 ? ViewStyles.mr2 : undefined}
                            />
                          )
                        )}
                      </HStack>
                    </ScrollView>
                  )}
                  <VStack style={ViewStyles.px4}>
                    {[
                      result.coop.coopHistoryDetail!.myResult,
                      ...result.coop.coopHistoryDetail!.memberResults,
                    ].map((memberResult, i, memberResults) => (
                      <CoopPlayerButton
                        key={i}
                        first={i === 0}
                        last={i === memberResults.length - 1}
                        name={formatName(
                          memberResult.player.name,
                          memberResult.player.species,
                          i === 0
                        )}
                        subtitle={`${t("boss_salmonids")} x${memberResult.defeatEnemyCount}`}
                        mainWeapons={memberResult.weapons.map((weapon) =>
                          getImageCacheSource(weapon.image.url)
                        )}
                        specialWeapon={
                          memberResult.specialWeapon
                            ? getImageCacheSource(memberResult.specialWeapon.image.url)
                            : undefined
                        }
                        deliverGoldenEgg={memberResult.goldenDeliverCount}
                        assistGoldenEgg={memberResult.goldenAssistCount}
                        powerEgg={memberResult.deliverCount}
                        rescue={memberResult.rescueCount}
                        rescued={memberResult.rescuedCount}
                        onPress={() => {
                          setCoopPlayer(memberResult);
                          setDisplayCoopPlayer(true);
                        }}
                      />
                    ))}
                  </VStack>
                </VStack>
                <VStack style={[ViewStyles.mb2, ViewStyles.px4]}>
                  <AccordionDisplay
                    first
                    last
                    title={t("details")}
                    subChildren={
                      <VStack>
                        <Display level={1} title={t("stage")}>
                          <Text numberOfLines={1}>
                            {`${td(result.coop.coopHistoryDetail!.coopStage)}`}
                          </Text>
                        </Display>
                        <Display level={1} title={t("supplied_weapons")}>
                          <HStack center>
                            {result.coop.coopHistoryDetail!.weapons.map((weapon, i, weapons) => (
                              <Image
                                key={i}
                                source={getImageCacheSource(weapon.image.url)}
                                style={[
                                  i === weapons.length - 1 ? undefined : ViewStyles.mr1,
                                  { width: 24, height: 24 },
                                ]}
                              />
                            ))}
                          </HStack>
                        </Display>
                        {result.coop.coopHistoryDetail!.dangerRate > 0 && (
                          <Display level={1} title={t("hazard_level")}>
                            <Text numberOfLines={1}>{formatHazardLevel(result.coop)}</Text>
                          </Display>
                        )}
                        {result.coop.coopHistoryDetail!.afterGrade && (
                          <Display level={1} title={t("job_title")}>
                            <Text numberOfLines={1}>{`${td(
                              result.coop.coopHistoryDetail!.afterGrade
                            )} ${result.coop.coopHistoryDetail!.afterGradePoint}`}</Text>
                          </Display>
                        )}
                        {result.coop.coopHistoryDetail!.jobPoint !== null && (
                          <AccordionDisplay
                            level={1}
                            title={t("your_points")}
                            subChildren={
                              <VStack>
                                <Display level={2} title={t("job_score")}>
                                  <Text numberOfLines={1}>
                                    {result.coop.coopHistoryDetail!.jobScore ?? "-"}
                                  </Text>
                                </Display>
                                <Display level={2} title={t("pay_grade")}>
                                  <Text numberOfLines={1}>
                                    {result.coop.coopHistoryDetail!.jobRate?.toFixed(2) ?? "-"}
                                  </Text>
                                </Display>
                                <Display level={2} title={t("clear_bonus")}>
                                  <Text numberOfLines={1}>
                                    {result.coop.coopHistoryDetail!.jobBonus ?? "-"}
                                  </Text>
                                </Display>
                              </VStack>
                            }
                          >
                            <Text numberOfLines={1}>{result.coop.coopHistoryDetail!.jobPoint}</Text>
                          </AccordionDisplay>
                        )}
                        {result.coop.coopHistoryDetail!.smellMeter !== null && (
                          <VStack>
                            <Display level={1} title={t("salmometer")}>
                              <HStack center>
                                {new Array(5).fill(0).map((_, i, rects) => (
                                  <Rectangle
                                    key={i}
                                    width={16}
                                    height={8}
                                    style={[
                                      i !== rects.length - 1 && ViewStyles.mr0_25,
                                      i === 0 && ViewStyles.rl0_5,
                                      i === rects.length - 1 && ViewStyles.rr0_5,
                                      {
                                        backgroundColor:
                                          result.coop!.coopHistoryDetail!.smellMeter! >= i + 1
                                            ? getCoopRuleColor(
                                                result.coop!.coopHistoryDetail!.rule
                                              )!
                                            : Color.MiddleTerritory,
                                      },
                                    ]}
                                  />
                                ))}
                              </HStack>
                            </Display>
                          </VStack>
                        )}
                        {result.coop.coopHistoryDetail!.scenarioCode && (
                          <VStack>
                            <Display level={1} title={t("scenario_code")}>
                              <Text numberOfLines={1}>
                                {formatScenarioCode(result.coop.coopHistoryDetail!.scenarioCode)}
                              </Text>
                            </Display>
                          </VStack>
                        )}
                        <Display last level={1} title={t("played_time")}>
                          <Text numberOfLines={1}>
                            {formatPlayedTime(result.coop.coopHistoryDetail!.playedTime)}
                          </Text>
                        </Display>
                      </VStack>
                    }
                  />
                </VStack>
                <VStack style={ViewStyles.px4}>
                  <Button
                    style={[ViewStyles.mb2, ViewStyles.accent]}
                    onPress={onHidePlayerNamesPress}
                  >
                    <Marquee style={theme.reverseTextStyle}>
                      {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                    </Marquee>
                  </Button>
                  <Button
                    style={[ViewStyles.mb2, ViewStyles.accent]}
                    onPress={onShowRawResultPress}
                  >
                    <Marquee style={theme.reverseTextStyle}>{t("show_raw_data")}</Marquee>
                  </Button>
                  <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                    <Marquee style={theme.reverseTextStyle}>
                      {t("open_in_nintendo_switch_online")}
                    </Marquee>
                  </Button>
                </VStack>
              </VStack>
              <Modal
                isVisible={displayCoopPlayer}
                onClose={onDisplayCoopPlayerClose}
                style={ViewStyles.modal1d}
              >
                {coopPlayer && (
                  <VStack center>
                    <Splashtag
                      color={getColor(coopPlayer.player.nameplate!.background.textColor)}
                      name={coopPlayer.player.name}
                      nameId={coopPlayer.player.nameId}
                      // TODO: need translation.
                      title={coopPlayer.player.byname}
                      banner={getImageCacheSource(
                        coopPlayer.player.nameplate!.background.image.url
                      )}
                      badges={coopPlayer.player.nameplate!.badges.map(formatBadge)}
                      style={ViewStyles.mb2}
                    />
                    {coopPlayer.specialWeapon && (
                      <CoopWeaponBox
                        mainWeapons={coopPlayer.weapons.map((weapon) =>
                          getImageCacheSource(weapon.image.url)
                        )}
                        specialWeapon={getImageCacheSource(coopPlayer.specialWeapon.image.url)}
                        style={ViewStyles.mb2}
                      />
                    )}
                    <WorkSuitBox
                      image={getImageCacheSource(coopPlayer.player.uniform.image.url)}
                      name={td(coopPlayer.player.uniform)}
                    />
                  </VStack>
                )}
              </Modal>
            </TitledList>
            {i !== undefined && (
              <PureIconButton
                disabled={i === 0}
                size={24}
                icon="chevron-left"
                hitSlop={8}
                style={{ position: "absolute", top: 14, left: 16, marginLeft: -4 }}
                onPress={onShowNextResultPress}
              />
            )}
            {i !== undefined && (
              <PureIconButton
                disabled={i === (results?.length ?? 1) - 1}
                size={24}
                icon="chevron-right"
                hitSlop={8}
                style={{ position: "absolute", top: 14, right: 16, marginRight: -4 }}
                onPress={onShowPreviousResultPress}
              />
            )}
          </>
        )}
      </Modal>
      <StatsModal
        stats={stats}
        dimension={dimension}
        hideEmpty
        isVisible={displayGroup}
        onClose={onDisplayGroupClose}
      >
        <SegmentedControl
          values={[t("self"), t("team")]}
          selectedIndex={dimension}
          onChange={onDimensionChange}
          style={ViewStyles.mb2}
        />
      </StatsModal>
    </VStack>
  );
};

export default ResultView;
