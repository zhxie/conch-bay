import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import * as Clipboard from "expo-clipboard";
import { useRef, useState } from "react";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  ViewStyle,
  useColorScheme,
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
  HStack,
  KingSalmonidBox,
  Marquee,
  Modal,
  Splashtag,
  Text,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
  WaveBox,
  WorkSuitBox,
  useBanner,
} from "../components";
import t, { ScopeWithDefaultValue, td } from "../i18n";
import {
  Award,
  AwardRank,
  Badge,
  CoopHistoryDetailResult,
  CoopMemberResult,
  CoopPlayerResult,
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
import {
  getCoopRuleColor,
  getImageCacheSource,
  getColor,
  getVsModeColor,
  getVsSelfPlayer,
  getGearPadding,
} from "../utils/ui";

dayjs.extend(duration);

export interface ResultProps {
  battle?: VsHistoryDetailResult;
  coop?: CoopHistoryDetailResult;
}
interface ResultViewProps {
  results?: ResultProps[];
  refreshControl: React.ReactElement<RefreshControlProps>;
  header: React.ReactElement;
  footer: React.ReactElement;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style?: StyleProp<ViewStyle>;
}

const ResultView = (props: ResultViewProps) => {
  const colorScheme = useColorScheme();
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const showBanner = useBanner();

  const [result, setResult] = useState<ResultProps>();
  const [displayCoopGrade, setDisplayCoopGrade] = useState(false);
  const [displayResult, setDisplayResult] = useState(false);
  const [displayBattle, setDisplayBattle] = useState(false);
  const [battlePlayer, setBattlePlayer] = useState<VsPlayer>();
  const [displayBattlePlayer, setDisplayBattlePlayer] = useState(false);
  const [displayCoop, setDisplayCoop] = useState(false);
  const [coopPlayer, setCoopPlayer] = useState<CoopPlayerResult>();
  const [displayCoopPlayer, setDisplayCoopPlayer] = useState(false);
  const willDisplayResult = useRef(false);
  const [hidePlayerNames, setHidePlayerNames] = useState(false);

  const isVsPlayerDragon = (player: VsPlayer) => {
    switch (player.festDragonCert as FestDragonCert) {
      case FestDragonCert.NONE:
        return false;
      case FestDragonCert.DRAGON:
      case FestDragonCert.DOUBLE_DRAGON:
        return true;
    }
  };
  const IsCoopClear = (coop: CoopHistoryDetailResult) => {
    if (coop.coopHistoryDetail!.resultWave === 0) {
      if (coop.coopHistoryDetail!.bossResult) {
        return coop.coopHistoryDetail!.bossResult.hasDefeatBoss;
      }
      return true;
    }
    return false;
  };
  const IsCoopWaveClear = (coop: CoopHistoryDetailResult, wave: number) => {
    if (coop.coopHistoryDetail!.resultWave === 0) {
      if (!coop.coopHistoryDetail!.waveResults[wave].deliverNorm) {
        return coop.coopHistoryDetail!.bossResult!.hasDefeatBoss;
      }
      return true;
    }
    return wave + 1 < coop.coopHistoryDetail!.resultWave;
  };

  const formatJudgement = (battle: VsHistoryDetailResult) => {
    switch (battle.vsHistoryDetail!.judgement as Judgement) {
      case Judgement.WIN:
        return 1;
      case Judgement.DRAW:
        return 0;
      case Judgement.LOSE:
      case Judgement.DEEMED_LOSE:
        return -1;
      case Judgement.EXEMPTED_LOSE:
        return -2;
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
  const formatWave = (coop: CoopHistoryDetailResult) => {
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
  const formatHazardLevel = (coop: CoopHistoryDetailResult) => {
    if (coop.coopHistoryDetail!.dangerRate > 0) {
      return `(${parseInt(String(coop.coopHistoryDetail!.dangerRate * 100))}%)`;
    }
    return "";
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
      return "-";
    }
    return td(waveResult.eventWave);
  };
  const formatSpecialWeapon = (coop: CoopHistoryDetailResult, i: number, begin: number) => {
    const map = [
      coop.coopHistoryDetail!.myResult.specialWeapon!.name,
      ...coop.coopHistoryDetail!.memberResults.map(
        (memberResult: CoopMemberResult) => memberResult.specialWeapon!.name
      ),
    ];

    let last = new Array(coop.coopHistoryDetail!.memberResults.length + 1).fill(0);
    const current = new Array(coop.coopHistoryDetail!.memberResults.length + 1).fill(0);
    for (let j = begin; j <= i; j++) {
      last = [...current];
      coop.coopHistoryDetail!.waveResults[j].specialWeapons.forEach((specialWeapon) => {
        const k = map.findIndex((item) => item === specialWeapon.name);
        current[k] = current[k] + 1;
      });
    }

    const result = current.map((_, i) => ({ use: current[i], used: last[i] }));
    return result;
  };

  const onDisplayCoopGradePress = () => {
    setDisplayCoopGrade(!displayCoopGrade);
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
  const onShowRawResultPress = () => {
    willDisplayResult.current = true;
    setDisplayBattle(false);
    setDisplayCoop(false);
  };
  const onOpenInNintendoSwitchOnlinePress = async () => {
    if (result!.battle) {
      await Linking.openURL(
        `com.nintendo.znca://znca/game/4834290508791808?p=/history/detail/${
          result!.battle.vsHistoryDetail!.id
        }`
      );
    } else {
      await Linking.openURL(
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
    if (willDisplayResult.current) {
      willDisplayResult.current = false;
      setDisplayResult(true);
    }
  };
  const onHidePlayerNamesPress = () => {
    setHidePlayerNames(!hidePlayerNames);
  };

  const renderItem = (result: ListRenderItemInfo<ResultProps>) => {
    if (result.item.battle) {
      return (
        <VStack flex style={ViewStyles.px4}>
          <BattleButton
            isFirst={result.index === 0}
            isLast={false}
            color={getVsModeColor(result.item.battle.vsHistoryDetail!.vsMode)!}
            result={formatJudgement(result.item.battle)}
            rule={td(result.item.battle.vsHistoryDetail!.vsRule)}
            dragon={formatDragon(result.item.battle)}
            stage={td(result.item.battle.vsHistoryDetail!.vsStage)}
            weapon={td(getVsSelfPlayer(result.item.battle).weapon)}
            kill={getVsSelfPlayer(result.item.battle).result?.kill}
            assist={getVsSelfPlayer(result.item.battle).result?.assist}
            death={getVsSelfPlayer(result.item.battle).result?.death}
            special={getVsSelfPlayer(result.item.battle).result?.special}
            ultraSignal={
              result.item.battle.vsHistoryDetail!.myTeam.tricolorRole !== "DEFENSE"
                ? getVsSelfPlayer(result.item.battle).result?.noroshiTry
                : undefined
            }
            onPress={() => {
              setResult({ battle: (result.item as ResultProps).battle });
              setDisplayBattle(true);
            }}
          />
        </VStack>
      );
    }
    const powerEgg =
      // HACK: cast out union uncertainty.
      (result.item.coop!.coopHistoryDetail!.memberResults as CoopMemberResult[]).reduce(
        (sum, result) => sum + result.deliverCount,
        result.item.coop!.coopHistoryDetail!.myResult.deliverCount
      );
    const goldenEgg = result.item.coop!.coopHistoryDetail!.waveResults.reduce(
      (sum, result) => sum + (result.teamDeliverCount ?? 0),
      0
    );
    return (
      <VStack flex style={ViewStyles.px4}>
        <CoopButton
          isFirst={result.index === 0}
          isLast={false}
          color={getCoopRuleColor(result.item.coop!.coopHistoryDetail!.rule)!}
          result={result.item.coop!.coopHistoryDetail!.resultWave === 0 ? 1 : -1}
          rule={t(result.item.coop!.coopHistoryDetail!.rule)}
          stage={td(result.item.coop!.coopHistoryDetail!.coopStage)}
          kingSalmonid={
            result.item.coop!.coopHistoryDetail!.bossResult
              ? td(result.item.coop!.coopHistoryDetail!.bossResult.boss)
              : undefined
          }
          wave={formatWave(result.item.coop!)!}
          isClear={IsCoopClear(result.item.coop!)}
          hazardLevel={formatHazardLevel(result.item.coop!)}
          grade={
            result.item.coop!.coopHistoryDetail!.afterGrade
              ? td(result.item.coop!.coopHistoryDetail!.afterGrade)
              : undefined
          }
          gradePoint={result.item.coop!.coopHistoryDetail!.afterGradePoint || 0}
          gradeChange={
            result.item.coop!.coopHistoryDetail!.resultWave === 0
              ? 1
              : result.item.coop!.coopHistoryDetail!.resultWave < 3
              ? -1
              : 0
          }
          displayGrade={result.extraData}
          powerEgg={powerEgg}
          goldenEgg={goldenEgg}
          onPress={() => {
            setResult({ coop: (result.item as ResultProps).coop });
            setDisplayCoop(true);
          }}
          onDisplayGradePress={onDisplayCoopGradePress}
        />
      </VStack>
    );
  };

  return (
    <VStack flex>
      <FlashList
        refreshControl={props.refreshControl}
        data={props.results}
        keyExtractor={(result) => {
          if (result.battle) {
            return result.battle.vsHistoryDetail!.id;
          }
          return result.coop!.coopHistoryDetail!.id;
        }}
        renderItem={renderItem}
        extraData={displayCoopGrade}
        estimatedItemSize={64}
        ListEmptyComponent={
          <VStack flex style={ViewStyles.px4}>
            {new Array(props.results === undefined ? 8 : 0).fill(0).map((_, i) => (
              <BattleButton
                key={i}
                isLoading={true}
                isFirst={i === 0}
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
        onScrollEndDrag={props.onScrollEndDrag}
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
            skipKeys={[
              "__typename",
              "__isGear",
              "__isPlayer",
              "image",
              "image2d",
              "image2dThumbnail",
              "image3d",
              "image3dThumbnail",
              "maskingImage",
              "originalImage",
              "thumbnailImage",
              "nextHistoryDetail",
              "previousHistoryDetail",
            ]}
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
                          {`${team.festTeamName ? `${team.festTeamName} ` : ""}${
                            (team["festStreakWinCount"] ?? 0) > 1
                              ? `${t("n_win_strike", { n: team["festStreakWinCount"] })} `
                              : ""
                          }${team["festUniformName"] ? `${team["festUniformName"]}` : ""}`}
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
                      isFirst={i === 0}
                      isLast={i === players.length - 1}
                      name={formatName(player.name, player.species, player.isMyself)}
                      weapon={getImageCacheSource(player.weapon.image2d.url)}
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
                      style={{ alignItems: "center" }}
                    />
                  ))}
                </VStack>
              ))}
              <VStack style={ViewStyles.mb2}>
                <AccordionDisplay
                  isFirst
                  isLast
                  title={t("details")}
                  subChildren={
                    <VStack>
                      {result.battle.vsHistoryDetail!.bankaraMatch?.earnedUdemaePoint && (
                        <Display title={t("rank_points")}>
                          <Text numberOfLines={1}>
                            {`${
                              result.battle.vsHistoryDetail!.bankaraMatch.earnedUdemaePoint > 0
                                ? "+"
                                : ""
                            }${result.battle.vsHistoryDetail!.bankaraMatch.earnedUdemaePoint}p`}
                          </Text>
                        </Display>
                      )}
                      {result.battle.vsHistoryDetail!.xMatch?.lastXPower && (
                        <Display title={t("x_power")}>
                          <Text numberOfLines={1}>
                            {`${result.battle.vsHistoryDetail!.xMatch.lastXPower.toFixed(1)}`}
                          </Text>
                        </Display>
                      )}
                      {result.battle.vsHistoryDetail!.festMatch && (
                        <VStack>
                          <Display title={t("clout")}>
                            <Text numberOfLines={1}>
                              {`${result.battle.vsHistoryDetail!.festMatch.contribution}`}
                            </Text>
                          </Display>
                          <Display title={t("festival_shell")}>
                            <Text numberOfLines={1}>
                              {`${result.battle.vsHistoryDetail!.festMatch.jewel}`}
                            </Text>
                          </Display>
                          {result.battle.vsHistoryDetail!.festMatch.myFestPower && (
                            <Display title={t("splatfest_power")}>
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
                        <Display key={i} title={i === 0 ? t("medals_earned") : ""}>
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
                      <Display isLast title={t("played_time")}>
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
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onHidePlayerNamesPress}>
                <Marquee style={reverseTextColor}>
                  {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                </Marquee>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShowRawResultPress}>
                <Marquee style={reverseTextColor}>{t("show_raw_data")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                <Marquee style={reverseTextColor}>{t("open_in_nintendo_switch_online")}</Marquee>
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
                    specialWeapon={getImageCacheSource(battlePlayer.weapon.specialWeapon.image.url)}
                    style={ViewStyles.mb2}
                  />
                  {[battlePlayer.headGear, battlePlayer.clothingGear, battlePlayer.shoesGear].map(
                    (gear, i, gears) => (
                      // TODO: show brands with its image, name and favorite.
                      <GearBox
                        key={i}
                        isFirst={i === 0}
                        isLast={i === gears.length - 1}
                        image={getImageCacheSource(gear.originalImage.url)}
                        brandImage={getImageCacheSource(gear.brand.image.url)}
                        // TODO: need translation.
                        name={gear.name}
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
        )}
      </Modal>
      <Modal
        isVisible={displayCoop}
        onClose={onDisplayCoopClose}
        onModalHide={onModalHide}
        style={[ViewStyles.modal3d, { paddingHorizontal: 0 }]}
      >
        {result?.coop && (
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
                              IsCoopWaveClear(result.coop!, i)
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
                            specialWeapons={formatSpecialWeapon(
                              result.coop!,
                              i,
                              waveResult.deliverNorm ? 0 : i
                            )}
                            specialWeaponSupplied={waveResult.deliverNorm ? 2 : 1}
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
                            result.coop.coopHistoryDetail!.bossResult.boss as ScopeWithDefaultValue
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
                      isFirst={i === 0}
                      isLast={i === memberResults.length - 1}
                      name={formatName(
                        memberResult.player.name,
                        memberResult.player.species,
                        i === 0
                      )}
                      subtitle={`${t("boss_salmonids")} x${memberResult.defeatEnemyCount}`}
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
                  isFirst
                  isLast
                  title={t("details")}
                  subChildren={
                    <VStack>
                      <Display title={t("your_points")}>
                        <Text numberOfLines={1}>
                          {result.coop.coopHistoryDetail!.jobPoint ?? "-"}
                        </Text>
                      </Display>
                      <Display title={t("job_score")}>
                        <Text numberOfLines={1}>
                          {result.coop.coopHistoryDetail!.jobScore ?? "-"}
                        </Text>
                      </Display>
                      <Display title={t("pay_grade")}>
                        <Text numberOfLines={1}>
                          {result.coop.coopHistoryDetail!.jobRate?.toFixed(2) ?? "-"}
                        </Text>
                      </Display>
                      <Display title={t("clear_bonus")}>
                        <Text numberOfLines={1}>
                          {result.coop.coopHistoryDetail!.jobBonus ?? "-"}
                        </Text>
                      </Display>
                      {result.coop.coopHistoryDetail!.smellMeter !== null && (
                        <VStack>
                          <Display title={t("smell")}>
                            <Text numberOfLines={1}>
                              {`${result.coop.coopHistoryDetail!.smellMeter}/5`}
                            </Text>
                          </Display>
                        </VStack>
                      )}
                      <Display isLast title={t("played_time")}>
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
                  <Marquee style={reverseTextColor}>
                    {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                  </Marquee>
                </Button>
                <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShowRawResultPress}>
                  <Marquee style={reverseTextColor}>{t("show_raw_data")}</Marquee>
                </Button>
                <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                  <Marquee style={reverseTextColor}>{t("open_in_nintendo_switch_online")}</Marquee>
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
                  />
                </VStack>
              )}
            </Modal>
          </TitledList>
        )}
      </Modal>
    </VStack>
  );
};

export default ResultView;
