import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import JSONTree from "react-native-json-tree";
import ViewShot from "react-native-view-shot";
import {
  AccordionDisplay,
  AccordionDisplayHandle,
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
  EmptyBossSalmonidBox,
  GearBox,
  GroupButton,
  HStack,
  Icon,
  Image,
  Marquee,
  Modal,
  PureIconButton,
  Rectangle,
  Result as CResult,
  ResultButton,
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
import t, { td } from "../i18n";
import abilityList from "../models/abilities.json";
import awardList from "../models/awards.json";
import titleList from "../models/titles.json";
import {
  Award,
  AwardRank,
  Badge,
  CoopHistoryDetailResult,
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
import weaponList from "../models/weapons.json";
import { fetchXRankings } from "../utils/api";
import { decode64BattlePlayerId, decode64CoopPlayerId } from "../utils/codec";
import { BattleBrief, Brief, CoopBrief, getSelfBattlePlayerBrief } from "../utils/stats";
import {
  getCoopRuleColor,
  getImageCacheSource,
  getImageHash,
  getColor,
  getVsModeColor,
  getGearPadding,
  roundPower,
} from "../utils/ui";
import { StatsModal } from "./StatsView";

interface Result {
  battle?: VsHistoryDetailResult;
  coop?: CoopHistoryDetailResult;
}
interface BriefOrGroup extends Brief {
  group?: Brief[];
}
interface ResultViewProps {
  briefs?: Brief[];
  refreshControl: React.ReactElement<RefreshControlProps>;
  header: React.ReactElement;
  footer: React.ReactElement;
  filterDisabled?: boolean;
  onFilterPlayer: (id: string, name: string) => void;
  onQuery: (id: string) => Result | undefined;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollToTop?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style?: StyleProp<ViewStyle>;
}

const xRankingSet = new Set<string>();

const ResultView = (props: ResultViewProps) => {
  const { height } = useWindowDimensions();
  // HACK: expect there is 480px occupied by other components.
  const placeholder = Math.ceil((height - 480) / 64);

  const theme = useTheme();

  const showBanner = useBanner();

  const [result, setResult] = useState<Result>();
  const [displayResult, setDisplayResult] = useState(false);
  const [displayBattle, setDisplayBattle] = useState(false);
  const [battlePlayer, setBattlePlayer] = useState<VsPlayer>();
  const [displayBattlePlayer, setDisplayBattlePlayer] = useState(false);
  const [xRankings, setXRankings] = useState(false);
  const [checkingXRankings, setCheckingXRankings] = useState(false);
  const [displayCoop, setDisplayCoop] = useState(false);
  const [coopPlayer, setCoopPlayer] = useState<CoopPlayerResult>();
  const [displayCoopPlayer, setDisplayCoopPlayer] = useState(false);
  const willDisplayNext = useRef<Result>();
  const willDisplayResult = useRef<boolean>(false);
  const [hidePlayerNames, setHidePlayerNames] = useState(false);
  const [group, setGroup] = useState<Brief[]>();
  const [displayGroup, setDisplayGroup] = useState(false);
  const [dimension, setDimension] = useState(0);

  const battleRef = useRef<ViewShot>(null);
  const battleDetailsRef = useRef<AccordionDisplayHandle>(null);
  const battleFade = useRef(new Animated.Value(1)).current;
  const coopRef = useRef<ViewShot>(null);
  const coopDetailsRef = useRef<AccordionDisplayHandle>(null);
  const coopFade = useRef(new Animated.Value(1)).current;

  const canGroupBattle = (battle: BattleBrief, group: Brief[]) => {
    // Battles with the same mode and in the 2 hours (24 hours for tricolors and unlimited for
    // privates) period will be regarded in the same group. There is also a 2 minutes grace period
    // for battles when certain conditions are met.
    // TODO: these grade conditions are not completed. E.g., regular battles even with the same
    // stages cannot be regarded as in the same rotation. We have to check the context (the above
    // only now) to group correctly.
    if (group[0]?.battle) {
      if (battle.mode === group[0].battle.mode) {
        switch (battle.mode) {
          case "VnNNb2RlLTE=":
          case "VnNNb2RlLTY=":
          case "VnNNb2RlLTc=":
            if (
              Math.floor(dayjs(battle.time).valueOf() / 7200000) ===
              Math.floor(dayjs(group[0].battle.time).valueOf() / 7200000)
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTI=":
          case "VnNNb2RlLTUx":
          case "VnNNb2RlLTM=":
          case "VnNNb2RlLTQ=":
            if (
              Math.floor(dayjs(battle.time).valueOf() / 7200000) ===
                Math.floor(dayjs(group[0].battle.time).valueOf() / 7200000) ||
              (battle.rule === group[0].battle.rule &&
                Math.floor(dayjs(battle.time).valueOf() / 7200000) ===
                  Math.floor(dayjs(group[0].battle.time).subtract(2, "minute").valueOf() / 7200000))
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTg=":
            if (
              Math.floor(dayjs(battle.time).valueOf() / 86400000) ===
                Math.floor(dayjs(group[0].battle.time).valueOf() / 86400000) ||
              Math.floor(dayjs(battle.time).valueOf() / 86400000) ===
                Math.floor(dayjs(group[0].battle.time).subtract(2, "minute").valueOf() / 86400000)
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTU=":
          default:
            return true;
        }
      }
    }
    return false;
  };
  const canGroupCoop = (coop: CoopBrief, group: Brief[]) => {
    // Coops with the same rule, stage and supplied weapons in the 48 hours (2 hours period) will be
    // regarded in the same group. There is also a 2 minutes grace period for coops when certain
    // conditions are met.
    if (group[0]?.coop) {
      if (
        coop.rule === group[0].coop.rule &&
        coop.stage === group[0].coop.stage &&
        coop.suppliedWeapons.join(",") === group[0].coop.suppliedWeapons.join(",") &&
        (Math.ceil(dayjs(coop.time).valueOf() / 7200000) -
          Math.floor(dayjs(group[0].coop.time).valueOf() / 7200000) <=
          24 ||
          Math.ceil(dayjs(coop.time).valueOf() / 7200000) -
            Math.floor(dayjs(group[0].coop.time).subtract(2, "minute").valueOf() / 7200000) <=
            24)
      ) {
        return true;
      }
    }
    return false;
  };

  const briefsAndGroups: BriefOrGroup[] | undefined = useMemo(() => {
    if (!props.briefs) {
      return undefined;
    }
    const groups: Brief[][] = [];
    for (const brief of props.briefs) {
      if (brief.battle) {
        if (groups.length === 0 || !canGroupBattle(brief.battle, groups[groups.length - 1])) {
          groups.push([brief]);
        } else {
          groups[groups.length - 1].push(brief);
        }
      } else {
        if (groups.length === 0 || !canGroupCoop(brief.coop!, groups[groups.length - 1])) {
          groups.push([brief]);
        } else {
          groups[groups.length - 1].push(brief);
        }
      }
    }
    const results: BriefOrGroup[] = [];
    for (const group of groups) {
      results.push({ group });
      if (group[0].battle) {
        results.push(...group.map((group) => ({ battle: group.battle! })));
      } else {
        results.push(...group.map((group) => ({ coop: group.coop! })));
      }
    }
    return results;
  }, [props.briefs]);

  const findIndex = () => {
    const id = result?.battle?.vsHistoryDetail?.id || result?.coop?.coopHistoryDetail?.id;
    if (id) {
      return briefsAndGroups?.findIndex(
        (result) => result.battle?.id === id || result.coop?.id === id
      );
    }
  };
  const currentResultIndex = useMemo(() => {
    const j = findIndex();
    if (j === undefined) {
      return undefined;
    }
    return j >= 0 ? j : undefined;
  }, [briefsAndGroups, result]);

  const isVsPlayerDragon = (player: VsPlayer) => {
    switch (player.festDragonCert as FestDragonCert) {
      case FestDragonCert.NONE:
        return false;
      case FestDragonCert.DRAGON:
      case FestDragonCert.DOUBLE_DRAGON:
        return true;
    }
  };
  const isCoopClear = (coop: CoopBrief) => {
    if (coop.result === 0) {
      if (coop.king) {
        return coop.king.defeat;
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

  const formatJudgement = (battle: BattleBrief) => {
    switch (battle.result) {
      case Judgement.WIN:
        return CResult.Win;
      case Judgement.DRAW:
        return CResult.Draw;
      case Judgement.LOSE:
      case Judgement.DEEMED_LOSE:
        return CResult.Lose;
      case Judgement.EXEMPTED_LOSE:
        return CResult.ExemptedLose;
    }
  };
  const formatDragon = (battle: BattleBrief) => {
    if (battle.dragon) {
      switch (battle.dragon) {
        case DragonMatchType.NORMAL:
          return undefined;
        case DragonMatchType.DECUPLE:
          return t("n_x_battle", { n: 10 });
        case DragonMatchType.DRAGON:
          return t("n_x_battle", { n: 100 });
        case DragonMatchType.DOUBLE_DRAGON:
          return t("n_x_battle", { n: 333 });
        case DragonMatchType.CONCH_SHELL_SCRAMBLE:
          return t("conch_clash");
        case DragonMatchType.CONCH_SHELL_SCRAMBLE_10:
          return t("n_x_conch_clash", { n: 10 });
        case DragonMatchType.CONCH_SHELL_SCRAMBLE_33:
          return t("n_x_conch_clash", { n: 33 });
      }
    }
  };
  const formatPower = (battle: BattleBrief) => {
    if (battle.power === undefined) {
      return undefined;
    }
    return roundPower(battle.power);
  };
  const formatSpecies = (species: Enum<typeof Species>) => {
    switch (species as Species) {
      case Species.INKLING:
        return "ᔦꙬᔨ三ᔦꙬᔨ✧‧˚";
      case Species.OCTOLING:
        return "( Ꙭ )三( Ꙭ )✧‧˚";
    }
  };
  const formatName = (name: string, species: Enum<typeof Species>, isSelf: boolean) => {
    if ((hidePlayerNames && !isSelf) || name.length > 10) {
      return formatSpecies(species);
    }
    return name;
  };
  const formatByname = (byname: string) => {
    const tags: { adjective: string; id: string; index: number }[] = [];
    let node = titleList.adjectives;
    let current = "";
    for (const char of byname) {
      if (!node[char]) {
        break;
      }
      node = node[char];
      current += char;
      for (const tag of node["tags"] ?? []) {
        tags.push({ adjective: current, id: tag["id"], index: tag["index"] });
      }
    }
    for (const tag of tags) {
      const subject = byname.slice(tag.adjective.length).trim();
      if (titleList.subjects[tag.index][subject]) {
        return t("title", {
          adjective: t(tag.id),
          subject: t(titleList.subjects[tag.index][subject]),
        });
      }
    }
    return byname;
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
  const formatHazardLevel = (hazardLevel: number) => {
    if (hazardLevel > 0) {
      return `${parseInt(String(hazardLevel * 100))}%`;
    }
    return "";
  };
  const formatCoopInfo = (coop: CoopBrief) => {
    if (coop.grade) {
      return `${t(coop.grade.id)} ${coop.grade.point}`;
    }
    if (coop.result < 0) {
      return "";
    }
    if (coop.result == 0) {
      if (coop.king) {
        return t("xtrawave");
      }
      switch (coop.rule) {
        case CoopRule.REGULAR:
        case CoopRule.BIG_RUN:
          return t("wave_n", { n: 3 });
        case CoopRule.TEAM_CONTEST:
          return t("wave_n", { n: 5 });
      }
    }
    return t("wave_n", { n: coop.result });
  };
  const formatGradeChange = (coop: CoopBrief) => {
    switch (coop.rule) {
      case CoopRule.REGULAR:
      case CoopRule.BIG_RUN:
        switch (coop.result) {
          case 0:
            return CResult.Win;
          default:
            if (coop.result < 3) {
              return CResult.Lose;
            }
            return CResult.Draw;
        }
      case CoopRule.TEAM_CONTEST:
        return undefined;
    }
  };
  const formatGroupPeriod = (start: number, end: number) => {
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
          return t("score_n", { score: team.result.score });
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
    // The first item in groupsAndResults is always a group.
    if (currentResultIndex !== undefined && currentResultIndex - 1 >= 1) {
      let offset = 1;
      if (briefsAndGroups![currentResultIndex - 1].group) {
        offset = 2;
      }
      const target = briefsAndGroups![currentResultIndex - offset];
      const result = props.onQuery(target.battle?.id ?? target.coop!.id);
      if (
        (displayBattle && target.battle) ||
        (displayCoop && briefsAndGroups![currentResultIndex - offset].coop)
      ) {
        setResult(result);
        return;
      }
      willDisplayNext.current = result;
    }
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onShowPreviousResultPress = () => {
    if (currentResultIndex !== undefined && currentResultIndex + 1 < briefsAndGroups!.length) {
      let offset = 1;
      if (briefsAndGroups![currentResultIndex + 1].group) {
        offset = 2;
      }
      const target = briefsAndGroups![currentResultIndex + offset];
      const result = props.onQuery(target.battle?.id ?? target.coop!.id);
      if (
        (displayBattle && briefsAndGroups![currentResultIndex + offset].battle) ||
        (displayCoop && briefsAndGroups![currentResultIndex + offset].coop)
      ) {
        setResult(result);
        return;
      }
      willDisplayNext.current = result;
    }
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onHidePlayerNamesPress = () => {
    setHidePlayerNames(!hidePlayerNames);
  };
  const onShareBattleImagePress = () => {
    battleDetailsRef.current!.expand();
    Animated.timing(battleFade, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(battleFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(async () => {
        try {
          const uri = await battleRef.current!.capture!();
          await Sharing.shareAsync(`file://${uri}`, { UTI: "public.png" });
        } catch {
          /* empty */
        }
      });
    });
  };
  const onShareCoopImagePress = () => {
    coopDetailsRef.current!.expand();
    // HACK: give enough time for pre-processing.
    Animated.timing(coopFade, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(coopFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(async () => {
        try {
          const uri = await coopRef.current!.capture!();
          await Sharing.shareAsync(`file://${uri}`, { UTI: "public.png" });
        } catch {
          /* empty */
        }
      });
    });
  };
  const onShowRawResultPress = () => {
    willDisplayResult.current = true;
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onCopyRawValue = async (value: any) => {
    await Clipboard.setStringAsync(value.toString());
    showBanner(BannerLevel.Info, t("copied_to_clipboard"));
  };
  const onViewXRankings = () => {
    const id = decode64BattlePlayerId(battlePlayer!.id);
    WebBrowser.openBrowserAsync(`https://splat.top/player/u-${id}`);
  };
  const onViewBattlesAndJobsWithThisPlayerPress = () => {
    if (displayBattlePlayer) {
      // HACK: we cannot parse encrypted IDs from ikawidget3.
      let id: string;
      try {
        id = decode64BattlePlayerId(battlePlayer!.id);
      } catch {
        showBanner(BannerLevel.Warn, t("failed_to_view_battles_and_jobs_with_this_player"));
        return;
      }
      props.onFilterPlayer(id, battlePlayer!.name);
      setDisplayBattlePlayer(false);
      setDisplayBattle(false);
    } else if (displayCoopPlayer) {
      // HACK: we cannot parse encrypted IDs from ikawidget3.
      let id: string;
      try {
        id = decode64CoopPlayerId(coopPlayer!.player.id);
      } catch {
        showBanner(BannerLevel.Warn, t("failed_to_view_battles_and_jobs_with_this_player"));
        return;
      }
      props.onFilterPlayer(id, coopPlayer!.player.name);
      setDisplayCoopPlayer(false);
      setDisplayCoop(false);
    }
  };
  const onAnalyzeBuildPress = () => {
    const weapon = weaponList.imagesRaw[getImageHash(battlePlayer!.weapon.image.url)];
    const abilities: string[] = [];
    for (const type of ["headGear", "clothingGear", "shoesGear"]) {
      abilities.push(
        abilityList.images[getImageHash(battlePlayer![type].primaryGearPower.image.url)]
      );
      for (let i = 0; i < 3; i++) {
        if (battlePlayer![type].additionalGearPowers.length > i) {
          abilities.push(
            abilityList.images[getImageHash(battlePlayer![type].additionalGearPowers[i].image.url)]
          );
        } else {
          abilities.push("U");
        }
      }
    }
    WebBrowser.openBrowserAsync(
      `https://sendou.ink/analyzer?weapon=${weapon}&build=${abilities.join(",")}`
    );
  };
  const onModalHide = () => {
    if (willDisplayResult.current) {
      setDisplayResult(true);
      willDisplayResult.current = false;
    } else if (willDisplayNext.current !== undefined) {
      if (willDisplayNext.current.battle) {
        setResult({ battle: willDisplayNext.current.battle });
        setDisplayBattle(true);
      } else if (willDisplayNext.current.coop) {
        setResult({ coop: willDisplayNext.current.coop });
        setDisplayCoop(true);
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

  const onBattlePress = useCallback((id: string) => {
    const result = props.onQuery(id);
    if (result?.battle) {
      setResult({ battle: result.battle });
      setDisplayBattle(true);
    }
  }, []);
  const onCoopPress = useCallback((id: string) => {
    const result = props.onQuery(id);
    if (result?.coop) {
      setResult({ coop: result.coop });
      setDisplayCoop(true);
    }
  }, []);
  const onGroupPress = useCallback((group: Brief[]) => {
    setGroup(group);
    setDisplayGroup(true);
  }, []);

  const renderItem = (result: ListRenderItemInfo<BriefOrGroup>) => {
    if (result.item.battle) {
      const color = getVsModeColor(result.item.battle.mode)!;
      const self = getSelfBattlePlayerBrief(result.item.battle);
      return (
        <VStack flex style={ViewStyles.px4}>
          <BattleButton
            id={result.item.battle.id}
            first={false}
            last={
              briefsAndGroups!.length > result.index + 1 &&
              briefsAndGroups![result.index + 1].group !== undefined
            }
            tag={
              result.extraData?.battle?.vsHistoryDetail?.id === result.item.battle.id
                ? color
                : undefined
            }
            color={color}
            result={formatJudgement(result.item.battle)}
            rule={t(result.item.battle.rule)}
            dragon={formatDragon(result.item.battle)}
            stage={t(result.item.battle.stage)}
            weapon={t(self.weapon)}
            power={formatPower(result.item.battle)}
            kill={self.kill}
            assist={self.assist}
            death={self.death}
            special={self.special}
            ultraSignal={self.ultraSignal}
            onPress={onBattlePress}
          />
        </VStack>
      );
    }
    if (result.item.coop) {
      const color = getCoopRuleColor(result.item.coop.rule)!;
      const powerEgg = result.item.coop.players.reduce((prev, current) => prev + current.power, 0);
      const goldenEgg = result.item.coop.players.reduce(
        (prev, current) => prev + current.golden,
        0
      );
      return (
        <VStack flex style={ViewStyles.px4}>
          <CoopButton
            id={result.item.coop!.id}
            first={false}
            last={
              briefsAndGroups!.length > result.index + 1 &&
              briefsAndGroups![result.index + 1].group !== undefined
            }
            tag={
              result.extraData?.coop?.coopHistoryDetail?.id === result.item.coop.id
                ? color
                : undefined
            }
            color={color}
            result={result.item.coop.result === 0 ? CResult.Win : CResult.Lose}
            rule={t(result.item.coop.rule)}
            stage={t(result.item.coop.stage)}
            kingSalmonid={result.item.coop.king ? t(result.item.coop.king.id) : undefined}
            isClear={isCoopClear(result.item.coop)}
            hazardLevel={formatHazardLevel(result.item.coop.hazardLevel)}
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
    if (result.item.group![0].battle) {
      mode = result.item.group![0].battle!.mode;
      period = formatGroupPeriod(
        result.item.group![result.item.group!.length - 1].battle!.time,
        result.item.group![0].battle!.time
      );
    } else {
      mode = result.item.group![0].coop!.rule;
      period = formatGroupPeriod(
        result.item.group![result.item.group!.length - 1].coop!.time,
        result.item.group![0].coop!.time
      );
    }
    return (
      <VStack flex style={ViewStyles.px4}>
        <GroupButton
          group={(result.item as BriefOrGroup).group}
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
        data={briefsAndGroups}
        keyExtractor={(groupAndResult) => {
          if (groupAndResult.battle) {
            return groupAndResult.battle.id;
          }
          if (groupAndResult.coop) {
            return groupAndResult.coop!.id;
          }
          if (groupAndResult.group![0].battle) {
            return `${groupAndResult.group![0].battle.id}-${groupAndResult.group!.length}`;
          }
          return `${groupAndResult.group![0].coop!.id}-${groupAndResult.group!.length}`;
        }}
        renderItem={renderItem}
        extraData={result}
        // HACK: use the smaller one.
        estimatedItemSize={32}
        ListEmptyComponent={
          <VStack flex style={ViewStyles.px4}>
            {new Array(placeholder).fill(0).map((_, i) => (
              <ResultButton
                key={i}
                disabled
                first={i === 0}
                color={Color.MiddleTerritory}
                title=""
                subtitle=""
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
          ViewStyles.modal1,
          {
            height: ViewStyles.modal1.maxHeight,
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
        style={[ViewStyles.modal2, { paddingHorizontal: 0 }]}
      >
        {result?.battle && (
          <Animated.View style={{ opacity: battleFade }}>
            <ViewShot
              ref={battleRef}
              // HACK: add padding around view shot, withdraw 16px margin in the top and 32px in the bottom, and add back 8px (mb2) in the bottom.
              style={[theme.backgroundStyle, ViewStyles.p4, { top: -16, marginBottom: -24 }]}
            >
              <TitledList
                color={getVsModeColor(result.battle.vsHistoryDetail!.vsMode.id)}
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
                          onPress={async () => {
                            setBattlePlayer(player);
                            setDisplayBattlePlayer(true);
                            setXRankings(false);
                            try {
                              const id = decode64BattlePlayerId(player.id);
                              if (xRankingSet.has(id)) {
                                setXRankings(true);
                                return;
                              }
                              setCheckingXRankings(true);
                              const result = await fetchXRankings(id);
                              if (result) {
                                xRankingSet.add(id);
                                setXRankings(true);
                              }
                            } catch {
                              showBanner(BannerLevel.Warn, t("failed_to_check_x_rankings"));
                            }
                            setCheckingXRankings(false);
                          }}
                        />
                      ))}
                    </VStack>
                  ))}
                  <VStack>
                    <AccordionDisplay
                      ref={battleDetailsRef}
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
                                  {`${roundPower(
                                    result.battle.vsHistoryDetail!.xMatch.lastXPower
                                  )}`}
                                </Text>
                              </Display>
                            )}
                          {result.battle.vsHistoryDetail!.leagueMatch && (
                            <VStack>
                              {result.battle.vsHistoryDetail!.leagueMatch.leagueMatchEvent && (
                                <Display level={1} title={t("challenge_e")}>
                                  <Text numberOfLines={1}>
                                    {td(
                                      result.battle.vsHistoryDetail!.leagueMatch.leagueMatchEvent
                                    )}
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
                              {result.battle.vsHistoryDetail!.festMatch.myFestPower !== null && (
                                <Display level={1} title={t("splatfest_power")}>
                                  <Text numberOfLines={1}>
                                    {`${result.battle.vsHistoryDetail!.festMatch.myFestPower.toFixed(
                                      1
                                    )}`}
                                  </Text>
                                </Display>
                              )}
                              <Display level={1} title={t("clout")}>
                                <Text numberOfLines={1}>
                                  {`${result.battle.vsHistoryDetail!.festMatch.contribution}`}
                                </Text>
                              </Display>
                              <Display level={1} title={t("festival_shell")}>
                                <HStack center>
                                  {new Array(7).fill(0).map((_, i, rects) => (
                                    <Circle
                                      key={i}
                                      size={8}
                                      style={[
                                        i !== rects.length - 1 && ViewStyles.mr0_5,
                                        {
                                          backgroundColor:
                                            result.battle!.vsHistoryDetail!.festMatch!.jewel >=
                                            i + 1
                                              ? Color.AccentColor
                                              : Color.MiddleTerritory,
                                        },
                                      ]}
                                    />
                                  ))}
                                </HStack>
                              </Display>
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
                                <Text numberOfLines={1}>
                                  {awardList.awards[award.name]
                                    ? t(awardList.awards[award.name])
                                    : award.name}
                                </Text>
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
                </VStack>
              </TitledList>
            </ViewShot>
            <VStack style={ViewStyles.px4}>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onHidePlayerNamesPress}>
                <Marquee style={theme.reverseTextStyle}>
                  {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                </Marquee>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShareBattleImagePress}>
                <Marquee style={theme.reverseTextStyle}>{t("share_image")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onShowRawResultPress}>
                <Marquee style={theme.reverseTextStyle}>{t("show_raw_data")}</Marquee>
              </Button>
            </VStack>
            <Modal
              isVisible={displayBattlePlayer}
              onClose={onDisplayBattlePlayerClose}
              style={ViewStyles.modal1}
            >
              {battlePlayer && (
                <VStack center>
                  <Splashtag
                    color={getColor(battlePlayer.nameplate!.background.textColor)}
                    name={
                      battlePlayer.name.length > 10
                        ? formatSpecies(battlePlayer.species)
                        : battlePlayer.name
                    }
                    nameId={battlePlayer.nameId}
                    title={formatByname(battlePlayer.byname)}
                    banner={getImageCacheSource(battlePlayer.nameplate!.background.image.url)}
                    badges={battlePlayer.nameplate!.badges.map(formatBadge)}
                    style={ViewStyles.mb2}
                  />
                  <BattleWeaponBox
                    image={getImageCacheSource(battlePlayer.weapon.image2d.url)}
                    name={td(battlePlayer.weapon)}
                    subWeapon={getImageCacheSource(battlePlayer.weapon.subWeapon.image.url)}
                    specialWeapon={getImageCacheSource(battlePlayer.weapon.specialWeapon.image.url)}
                    style={ViewStyles.mb2}
                  />
                  <VStack style={[ViewStyles.wf, ViewStyles.mb2]}>
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
                  <VStack style={ViewStyles.wf}>
                    <Button
                      style={[ViewStyles.mb2, ViewStyles.accent]}
                      onPress={onViewBattlesAndJobsWithThisPlayerPress}
                    >
                      <Marquee style={theme.reverseTextStyle}>
                        {t("view_battles_and_jobs_with_this_player")}
                      </Marquee>
                    </Button>
                    <Button
                      style={[ViewStyles.mb2, ViewStyles.accent]}
                      onPress={onAnalyzeBuildPress}
                    >
                      <Marquee style={[ViewStyles.mr1, theme.reverseTextStyle]}>
                        {t("analyze_build")}
                      </Marquee>
                      <Icon
                        name="external-link"
                        size={TextStyles.h5.fontSize}
                        color={theme.reverseTextStyle.color}
                      />
                    </Button>
                    <Button
                      disabled={!checkingXRankings && !xRankings}
                      loading={checkingXRankings}
                      loadingText={t("checking_x_rankings")}
                      style={ViewStyles.accent}
                      textStyle={theme.reverseTextStyle}
                      onPress={onViewXRankings}
                    >
                      <Marquee style={[ViewStyles.mr1, theme.reverseTextStyle]}>
                        {t("view_x_rankings")}
                      </Marquee>
                      <Icon
                        name="external-link"
                        size={TextStyles.h5.fontSize}
                        color={theme.reverseTextStyle.color}
                      />
                    </Button>
                  </VStack>
                </VStack>
              )}
            </Modal>
            {currentResultIndex !== undefined && (
              <PureIconButton
                disabled={currentResultIndex === 1}
                size={24}
                icon="chevron-left"
                hitSlop={8}
                style={{ position: "absolute", left: 16, marginLeft: -4 }}
                onPress={onShowNextResultPress}
              />
            )}
            {currentResultIndex !== undefined && (
              <PureIconButton
                // groupsAndResults has at least 2 items.
                disabled={currentResultIndex === (briefsAndGroups?.length ?? 2) - 1}
                size={24}
                icon="chevron-right"
                hitSlop={8}
                style={{ position: "absolute", right: 16, marginRight: -4 }}
                onPress={onShowPreviousResultPress}
              />
            )}
          </Animated.View>
        )}
      </Modal>
      <Modal
        isVisible={displayCoop}
        onClose={onDisplayCoopClose}
        onModalHide={onModalHide}
        style={[ViewStyles.modal2, { paddingHorizontal: 0 }]}
      >
        {result?.coop && (
          <Animated.View style={{ opacity: coopFade }}>
            <ViewShot
              ref={coopRef}
              // HACK: add padding around view shot, withdraw 16px margin in the top and 32px in the bottom, and add back 8px (mb2) in the bottom.
              style={[theme.backgroundStyle, ViewStyles.p4, { top: -16, marginBottom: -24 }]}
            >
              <TitledList
                color={getCoopRuleColor(result.coop.coopHistoryDetail!.rule)}
                title={t(result.coop.coopHistoryDetail!.rule)}
                subtitle={
                  result.coop.coopHistoryDetail!.resultWave === -1 ? t("penalty") : undefined
                }
              >
                <VStack style={ViewStyles.wf}>
                  <VStack style={ViewStyles.mb2}>
                    {result.coop.coopHistoryDetail!.waveResults.length > 0 && (
                      <VStack center style={ViewStyles.mb2}>
                        {result.coop.coopHistoryDetail!.waveResults.map(
                          (waveResult, i, waveResults) => (
                            <WaveBox
                              key={i}
                              color={
                                isCoopWaveClear(result.coop!, i)
                                  ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)!
                                  : undefined
                              }
                              first={i === 0}
                              last={i === waveResults.length - 1}
                              waterLevel={formatWaterLevel(waveResult)!}
                              eventWave={
                                waveResult.deliverNorm
                                  ? formatEventWave(waveResult)
                                  : td(result.coop!.coopHistoryDetail!.bossResult!.boss)
                              }
                              goldScale={
                                i === waveResults.length - 1
                                  ? result.coop!.coopHistoryDetail!.scale?.gold
                                  : undefined
                              }
                              silverScale={
                                i === waveResults.length - 1
                                  ? result.coop!.coopHistoryDetail!.scale?.silver
                                  : undefined
                              }
                              bronzeScale={
                                i === waveResults.length - 1
                                  ? result.coop!.coopHistoryDetail!.scale?.bronze
                                  : undefined
                              }
                              deliver={
                                waveResult.teamDeliverCount ??
                                (result.coop!.coopHistoryDetail!.bossResult!.hasDefeatBoss ? 1 : 0)
                              }
                              quota={waveResult.deliverNorm ?? 1}
                              appearance={waveResult.goldenPopCount}
                              specialWeapons={formatWaveSpecialWeapons(result.coop!, waveResult)}
                            />
                          )
                        )}
                      </VStack>
                    )}
                    <VStack
                      style={
                        result.coop.coopHistoryDetail!.enemyResults.length > 0 && ViewStyles.mb2
                      }
                    >
                      {[
                        result.coop.coopHistoryDetail!.myResult,
                        ...result.coop.coopHistoryDetail!.memberResults,
                      ].map((memberResult, i, memberResults) => (
                        <CoopPlayerButton
                          key={i}
                          first={i === 0}
                          last={i === memberResults.length - 1}
                          self={
                            i === 0
                              ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)
                              : undefined
                          }
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
                    {result.coop.coopHistoryDetail!.enemyResults.length > 0 && (
                      <VStack>
                        {new Array(
                          Math.floor((result.coop.coopHistoryDetail!.enemyResults.length + 2) / 3)
                        )
                          .fill(0)
                          .map((_, i, rows) => (
                            <HStack key={i}>
                              {new Array(3)
                                .fill(0)
                                .map((_, j, columns) =>
                                  3 * i + j >=
                                  result.coop!.coopHistoryDetail!.enemyResults.length ? (
                                    <EmptyBossSalmonidBox
                                      key={j}
                                      firstRow={i === 0}
                                      lastRow={
                                        !result.coop!.coopHistoryDetail!.bossResult &&
                                        i === rows.length - 1
                                      }
                                      firstColumn={j === 0}
                                      lastColumn={j === columns.length - 1}
                                    />
                                  ) : (
                                    <BossSalmonidBox
                                      key={j}
                                      firstRow={i === 0}
                                      lastRow={
                                        !result.coop!.coopHistoryDetail!.bossResult &&
                                        i === rows.length - 1
                                      }
                                      firstColumn={j === 0}
                                      lastColumn={j === columns.length - 1}
                                      color={
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .teamDefeatCount ===
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .popCount
                                          ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)!
                                          : undefined
                                      }
                                      name={td(
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .enemy
                                      )}
                                      defeat={
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .defeatCount
                                      }
                                      teamDefeat={
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .teamDefeatCount
                                      }
                                      appearance={
                                        result.coop!.coopHistoryDetail!.enemyResults[i * 3 + j]
                                          .popCount
                                      }
                                    />
                                  )
                                )}
                            </HStack>
                          ))}
                      </VStack>
                    )}
                    {result.coop.coopHistoryDetail!.bossResult && (
                      <VStack>
                        <HStack>
                          {(
                            result.coop.coopHistoryDetail!["bossResults"] || [
                              result.coop.coopHistoryDetail!.bossResult,
                            ]
                          ).map((bossResult, i, bossResults) => (
                            <BossSalmonidBox
                              key={i}
                              firstRow={result.coop!.coopHistoryDetail!.enemyResults.length === 0}
                              lastRow
                              firstColumn={i === 0}
                              lastColumn={i === bossResults.length - 1}
                              color={
                                bossResult.hasDefeatBoss
                                  ? getCoopRuleColor(result.coop!.coopHistoryDetail!.rule)!
                                  : undefined
                              }
                              name={td(bossResult.boss)}
                              defeat={0}
                              teamDefeat={bossResult.hasDefeatBoss ? 1 : 0}
                              appearance={1}
                            />
                          ))}
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                  <VStack>
                    <AccordionDisplay
                      ref={coopDetailsRef}
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
                              <Text numberOfLines={1}>
                                {formatHazardLevel(result.coop.coopHistoryDetail!.dangerRate)}
                              </Text>
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
                              <Text numberOfLines={1}>
                                {result.coop.coopHistoryDetail!.jobPoint}
                              </Text>
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
                </VStack>
              </TitledList>
            </ViewShot>
            <VStack style={ViewStyles.px4}>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onHidePlayerNamesPress}>
                <Marquee style={theme.reverseTextStyle}>
                  {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                </Marquee>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShareCoopImagePress}>
                <Marquee style={theme.reverseTextStyle}>{t("share_image")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onShowRawResultPress}>
                <Marquee style={theme.reverseTextStyle}>{t("show_raw_data")}</Marquee>
              </Button>
            </VStack>
            <Modal
              isVisible={displayCoopPlayer}
              onClose={onDisplayCoopPlayerClose}
              style={ViewStyles.modal1}
            >
              {coopPlayer && (
                <VStack center>
                  <Splashtag
                    color={getColor(coopPlayer.player.nameplate!.background.textColor)}
                    name={
                      coopPlayer.player.name.length > 10
                        ? formatSpecies(coopPlayer.player.species)
                        : coopPlayer.player.name
                    }
                    nameId={coopPlayer.player.nameId}
                    title={formatByname(coopPlayer.player.byname)}
                    banner={getImageCacheSource(coopPlayer.player.nameplate!.background.image.url)}
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
                    style={ViewStyles.mb2}
                  />
                  <VStack style={ViewStyles.wf}>
                    <Button
                      disabled={props.filterDisabled}
                      style={ViewStyles.accent}
                      onPress={onViewBattlesAndJobsWithThisPlayerPress}
                    >
                      <Marquee style={theme.reverseTextStyle}>
                        {t("view_battles_and_jobs_with_this_player")}
                      </Marquee>
                    </Button>
                  </VStack>
                </VStack>
              )}
            </Modal>
            {currentResultIndex !== undefined && (
              <PureIconButton
                disabled={currentResultIndex === 1}
                size={24}
                icon="chevron-left"
                hitSlop={8}
                style={{ position: "absolute", left: 16, marginLeft: -4 }}
                onPress={onShowNextResultPress}
              />
            )}
            {currentResultIndex !== undefined && (
              <PureIconButton
                // groupsAndResults has at least 2 items.
                disabled={currentResultIndex === (briefsAndGroups?.length ?? 2) - 1}
                size={24}
                icon="chevron-right"
                hitSlop={8}
                style={{ position: "absolute", right: 16, marginRight: -4 }}
                onPress={onShowPreviousResultPress}
              />
            )}
          </Animated.View>
        )}
      </Modal>
      <StatsModal
        briefs={group}
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
