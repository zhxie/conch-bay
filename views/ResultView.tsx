import { useRef, useState } from "react";
import { Linking, ScrollView, StyleProp, ViewStyle, useColorScheme } from "react-native";
import JSONTree from "react-native-json-tree";
import {
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
  GearBox,
  HStack,
  Modal,
  Splashtag,
  Text,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
  WaveBox,
  WorkSuitBox,
} from "../components";
import {
  CoopHistoryDetail,
  CoopPlayerResult,
  CoopWaveResult,
  PlayerBadge,
  Species,
  VsHistoryDetail,
  VsPlayer,
  VsTeam,
} from "../models/types";
import {
  getCoopGoldenEgg,
  getCoopIsClear,
  getCoopIsWaveClear,
  getCoopPowerEgg,
  getCoopRuleColor,
  getImageCacheSource,
  getMaxAdditionalGearPowerCount,
  getColor,
  getVsModeColor,
  getVsSelfPlayer,
  isCoopAnnotation,
} from "../utils/ui";

interface ResultViewProps {
  t: (f: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  loadMore: () => void;
  results?: { battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[];
  style?: StyleProp<ViewStyle>;
}
interface ResultProps {
  battle?: VsHistoryDetail;
  coop?: CoopHistoryDetail;
}
interface BattlePlayerProps {
  color: string;
  player: VsPlayer;
}

const ResultView = (props: ResultViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [result, setResult] = useState<ResultProps>();
  const [displayResult, setDisplayResult] = useState(false);
  const [displayBattle, setDisplayBattle] = useState(false);
  const [battlePlayer, setBattlePlayer] = useState<BattlePlayerProps>();
  const [displayBattlePlayer, setDisplayBattlePlayer] = useState(false);
  const [displayCoop, setDisplayCoop] = useState(false);
  const [coopPlayer, setCoopPlayer] = useState<CoopPlayerResult>();
  const [displayCoopPlayer, setDisplayCoopPlayer] = useState(false);
  const willDisplayResult = useRef(false);
  const [hidePlayerNames, setHidePlayerNames] = useState(false);

  const formatJudgement = (battle: VsHistoryDetail) => {
    switch (battle.vsHistoryDetail.judgement) {
      case "WIN":
        return 1;
      case "DRAW":
        return 0;
      case "LOSE":
      case "DEEMED_LOSE":
        return -1;
      case "EXEMPTED_LOSE":
        return -2;
    }
  };
  const formatName = (name: string, species: Species, isSelf: boolean) => {
    if (hidePlayerNames && !isSelf) {
      switch (species) {
        case "INKLING":
          return "ᔦꙬᔨ三ᔦꙬᔨ✧‧˚";
        case "OCTOLING":
          return "( Ꙭ )三( Ꙭ )✧‧˚";
      }
    }
    return name;
  };
  const formatBadge = (badge: PlayerBadge | null) => {
    if (badge) {
      return getImageCacheSource(badge.image.url);
    }

    return null;
  };
  const formatWave = (coop: CoopHistoryDetail) => {
    switch (coop.coopHistoryDetail.resultWave) {
      case -1:
        return "";
      case 1:
        return t("wave_1");
      case 2:
        return t("wave_2");
      case 3:
        return t("wave_3");
      case 0:
        if (coop.coopHistoryDetail.bossResult) {
          return t("xtrawave");
        }
        return t("wave_3");
    }
  };
  const formatHazardLevel = (coop: CoopHistoryDetail) => {
    if (coop.coopHistoryDetail.dangerRate > 0) {
      return `(${parseInt(String(coop.coopHistoryDetail.dangerRate * 100))}%)`;
    }
    return "";
  };
  const formatAnnotation = (battle: VsHistoryDetail) => {
    switch (battle.vsHistoryDetail.judgement) {
      case "WIN":
      case "LOSE":
        return undefined;
      case "DEEMED_LOSE":
        return t("penalty");
      case "EXEMPTED_LOSE":
        return t("exemption");
      case "DRAW":
        return t("no_contest");
    }
  };
  const formatTeams = (battle: VsHistoryDetail) => {
    const teams = [battle.vsHistoryDetail.myTeam, ...battle.vsHistoryDetail.otherTeams];
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
        if (team.result.score! === 100) {
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
    return t(waveResult.eventWave.id);
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
  const onOpenInNintendoSwitchOnlinePress = () => {
    if (result!.battle) {
      Linking.openURL(
        `com.nintendo.znca://znca/game/4834290508791808?p=/history/detail/${
          result!.battle.vsHistoryDetail.id
        }`
      );
    } else {
      Linking.openURL(
        `com.nintendo.znca://znca/game/4834290508791808?p=/coop/${
          result!.coop!.coopHistoryDetail.id
        }`
      );
    }
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

  return (
    <VStack style={[ViewStyles.px4, ViewStyles.wf, props.style]}>
      {(() => {
        if (props.results) {
          return props.results.map((result, i) => {
            if (result.battle) {
              return (
                <BattleButton
                  key={result.battle.vsHistoryDetail.id}
                  isFirst={i === 0}
                  isLast={false}
                  color={getVsModeColor(result.battle.vsHistoryDetail.vsMode)!}
                  result={formatJudgement(result.battle)}
                  rule={t(result.battle.vsHistoryDetail.vsRule.id)}
                  stage={t(result.battle.vsHistoryDetail.vsStage.id)}
                  weapon={t(getVsSelfPlayer(result.battle).weapon.id)}
                  kill={getVsSelfPlayer(result.battle).result?.kill}
                  assist={getVsSelfPlayer(result.battle).result?.assist}
                  death={getVsSelfPlayer(result.battle).result?.death}
                  special={getVsSelfPlayer(result.battle).result?.special}
                  ultraSignal={
                    result.battle.vsHistoryDetail.myTeam.tricolorRole !== "DEFENSE"
                      ? getVsSelfPlayer(result.battle).result?.noroshiTry
                      : undefined
                  }
                  onPress={() => {
                    setResult({ battle: result.battle! });
                    setDisplayBattle(true);
                  }}
                />
              );
            }
            return (
              <CoopButton
                key={result.coop!.coopHistoryDetail.id}
                isFirst={i === 0}
                isLast={false}
                color={getCoopRuleColor(result.coop!.coopHistoryDetail.rule)!}
                result={result.coop!.coopHistoryDetail.resultWave === 0 ? 1 : -1}
                rule={t(result.coop!.coopHistoryDetail.rule)}
                stage={t(result.coop!.coopHistoryDetail.coopStage.id)}
                kingSalmonid={
                  result.coop!.coopHistoryDetail.bossResult !== null
                    ? t(result.coop!.coopHistoryDetail.bossResult.boss.id)
                    : undefined
                }
                wave={formatWave(result.coop!)!}
                isClear={getCoopIsClear(result.coop!)}
                hazardLevel={formatHazardLevel(result.coop!)}
                powerEgg={getCoopPowerEgg(result.coop!)}
                goldenEgg={getCoopGoldenEgg(result.coop!)}
                onPress={() => {
                  setResult({ coop: result.coop! });
                  setDisplayCoop(true);
                }}
              />
            );
          });
        } else {
          return Array(8)
            .fill(0)
            .map((_, i) => {
              return (
                <BattleButton
                  key={i}
                  isLoading={true}
                  isFirst={i === 0}
                  color={Color.MiddleTerritory}
                  rule=""
                  stage=""
                  weapon=""
                />
              );
            });
        }
      })()}
      {
        <Button
          isLoading={props.isLoading}
          isLoadingText={t("loading_more")}
          style={[
            props.results?.length ?? 0 > 0
              ? {
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }
              : ViewStyles.rt,
            ViewStyles.rb,
            { height: 64 },
          ]}
          textStyle={TextStyles.h3}
          onPress={props.loadMore}
        >
          <Text numberOfLines={1} style={TextStyles.h3}>
            {t("load_more")}
          </Text>
        </Button>
      }
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
            color={getVsModeColor(result.battle.vsHistoryDetail.vsMode)}
            title={t(result.battle.vsHistoryDetail.vsMode.id)}
            subtitle={formatAnnotation(result.battle)}
          >
            <VStack style={ViewStyles.wf}>
              {formatTeams(result.battle).map((team, i) => (
                <VStack key={i} style={ViewStyles.mb2}>
                  <HStack center justify style={ViewStyles.mb1}>
                    <HStack center style={[ViewStyles.mr1, ViewStyles.f]}>
                      <Circle size={12} color={getColor(team.color)} style={ViewStyles.mr1} />
                      <Text
                        numberOfLines={1}
                        style={[TextStyles.b, { color: getColor(team.color) }]}
                      >
                        {team.festTeamName ?? ""}
                      </Text>
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
                  {team.players.map((player, i, players) => (
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
                      onPress={() => {
                        setBattlePlayer({ color: getColor(team.color), player });
                        setDisplayBattlePlayer(true);
                      }}
                      style={{ alignItems: "center" }}
                    />
                  ))}
                </VStack>
              ))}
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onHidePlayerNamesPress}>
                <Text numberOfLines={1} style={reverseTextColor}>
                  {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                </Text>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShowRawResultPress}>
                <Text numberOfLines={1} style={reverseTextColor}>
                  {t("show_raw_data")}
                </Text>
              </Button>
              <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                <Text numberOfLines={1} style={reverseTextColor}>
                  {t("open_in_nintendo_switch_online")}
                </Text>
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
                    color={getColor(battlePlayer.player.nameplate.background.textColor)}
                    name={battlePlayer.player.name}
                    nameId={battlePlayer.player.nameId}
                    // TODO: need translation.
                    title={battlePlayer.player.byname}
                    banner={getImageCacheSource(battlePlayer.player.nameplate.background.image.url)}
                    badges={battlePlayer.player.nameplate.badges.map(formatBadge)}
                    style={ViewStyles.mb2}
                  />
                  <BattleWeaponBox
                    image={getImageCacheSource(battlePlayer.player.weapon.image2d.url)}
                    name={t(battlePlayer.player.weapon.id)}
                    subWeapon={getImageCacheSource(battlePlayer.player.weapon.subWeapon.image.url)}
                    specialWeapon={getImageCacheSource(
                      battlePlayer.player.weapon.specialWeapon.image.url
                    )}
                    style={ViewStyles.mb2}
                  />
                  {[
                    battlePlayer.player.headGear,
                    battlePlayer.player.clothingGear,
                    battlePlayer.player.shoesGear,
                  ].map((gear, i, gears) => (
                    // TODO: show brands with its image, name and favorite.
                    <GearBox
                      key={i}
                      isFirst={i === 0}
                      isLast={i === gears.length - 1}
                      image={getImageCacheSource(gear.originalImage.url)}
                      brand={getImageCacheSource(gear.brand.image.url)}
                      // TODO: need translation.
                      name={gear.name}
                      primaryAbility={getImageCacheSource(gear.primaryGearPower.image.url)}
                      additionalAbility={gear.additionalGearPowers.map((gearPower) =>
                        getImageCacheSource(gearPower.image.url)
                      )}
                      paddingTo={getMaxAdditionalGearPowerCount(battlePlayer.player)}
                    />
                  ))}
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
            color={getCoopRuleColor(result.coop.coopHistoryDetail.rule)}
            title={t(result.coop.coopHistoryDetail.rule)}
            subtitle={isCoopAnnotation(result.coop) ? t("penalty") : undefined}
          >
            <VStack style={ViewStyles.wf}>
              <VStack style={ViewStyles.mb2}>
                {result.coop.coopHistoryDetail.waveResults.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={ViewStyles.mb2}
                  >
                    <HStack center style={ViewStyles.px4}>
                      {result.coop.coopHistoryDetail.waveResults.map(
                        (waveResult, i, waveResults) => {
                          if (i < 3) {
                            return (
                              <WaveBox
                                key={i}
                                color={
                                  getCoopIsWaveClear(result.coop!, i)
                                    ? getCoopRuleColor(result.coop!.coopHistoryDetail.rule)!
                                    : undefined
                                }
                                waterLevel={formatWaterLevel(waveResult)!}
                                eventWave={formatEventWave(waveResult)}
                                deliver={waveResult.teamDeliverCount!}
                                quota={waveResult.deliverNorm!}
                                appearance={waveResult.goldenPopCount}
                                style={i !== waveResults.length - 1 ? ViewStyles.mr2 : undefined}
                              />
                            );
                          }
                          return (
                            <WaveBox
                              key={i}
                              color={
                                result.coop!.coopHistoryDetail.bossResult!.hasDefeatBoss
                                  ? getCoopRuleColor(result.coop!.coopHistoryDetail.rule)!
                                  : undefined
                              }
                              isKingSalmonid
                              waterLevel={formatWaterLevel(waveResult)!}
                              eventWave={t(result.coop!.coopHistoryDetail.bossResult!.boss.id)}
                              deliver={
                                result.coop!.coopHistoryDetail.bossResult!.hasDefeatBoss ? 1 : 0
                              }
                              quota={1}
                              appearance={waveResult.goldenPopCount}
                              style={i !== waveResults.length - 1 ? ViewStyles.mr2 : undefined}
                            />
                          );
                        }
                      )}
                    </HStack>
                  </ScrollView>
                )}
                {(result.coop.coopHistoryDetail.enemyResults.length > 0 ||
                  result.coop.coopHistoryDetail.bossResult !== null) && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={ViewStyles.mb2}
                  >
                    <HStack center style={ViewStyles.px4}>
                      {result.coop.coopHistoryDetail.bossResult !== null && (
                        <BossSalmonidBox
                          color={
                            result.coop.coopHistoryDetail.bossResult.hasDefeatBoss
                              ? getCoopRuleColor(result.coop!.coopHistoryDetail.rule)!
                              : undefined
                          }
                          name={t(result.coop.coopHistoryDetail.bossResult.boss.id)}
                          defeat={0}
                          teamDefeat={
                            result.coop.coopHistoryDetail.bossResult.hasDefeatBoss ? 1 : 0
                          }
                          appearance={1}
                          style={
                            result.coop.coopHistoryDetail.enemyResults.length > 0
                              ? ViewStyles.mr2
                              : undefined
                          }
                        />
                      )}
                      {result.coop.coopHistoryDetail.enemyResults.map(
                        (enemyResult, i, enemyResults) => (
                          <BossSalmonidBox
                            key={i}
                            color={
                              enemyResult.teamDefeatCount === enemyResult.popCount
                                ? getCoopRuleColor(result.coop!.coopHistoryDetail.rule)!
                                : undefined
                            }
                            name={t(enemyResult.enemy.id)}
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
                    result.coop.coopHistoryDetail.myResult,
                    ...result.coop.coopHistoryDetail.memberResults,
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
              <VStack style={ViewStyles.px4}>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  onPress={onHidePlayerNamesPress}
                >
                  <Text numberOfLines={1} style={reverseTextColor}>
                    {hidePlayerNames ? t("show_player_names") : t("hide_player_names")}
                  </Text>
                </Button>
                <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onShowRawResultPress}>
                  <Text numberOfLines={1} style={reverseTextColor}>
                    {t("show_raw_data")}
                  </Text>
                </Button>
                <Button style={ViewStyles.accent} onPress={onOpenInNintendoSwitchOnlinePress}>
                  <Text numberOfLines={1} style={reverseTextColor}>
                    {t("open_in_nintendo_switch_online")}
                  </Text>
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
                    color={getColor(coopPlayer.player.nameplate.background.textColor)}
                    name={coopPlayer.player.name}
                    nameId={coopPlayer.player.nameId}
                    // TODO: need translation.
                    title={coopPlayer.player.byname}
                    banner={getImageCacheSource(coopPlayer.player.nameplate.background.image.url)}
                    badges={coopPlayer.player.nameplate.badges.map(formatBadge)}
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
                    name={t(coopPlayer.player.uniform.id)}
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
