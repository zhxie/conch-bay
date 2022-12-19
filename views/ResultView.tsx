import { useState } from "react";
import { ScrollView, StyleProp, useColorScheme, ViewStyle } from "react-native";
import JSONTree from "react-native-json-tree";
import {
  BattleButton,
  BattlePlayerButton,
  BossSalmonidBox,
  Button,
  Circle,
  CoopButton,
  CoopPlayerButton,
  HStack,
  Modal,
  Text,
  TextStyles,
  VStack,
  ViewStyles,
  WaveBox,
} from "../components";
import { Color, CoopHistoryDetail, CoopWaveResult, VsHistoryDetail, VsTeam } from "../models";
import {
  getCoopIsClear,
  getCoopIsWaveClear,
  getCoopRuleColor,
  getTeamColor,
  getVsJudgement,
  getVsModeColor,
  getVsSelfPlayer,
} from "../utils/ui";

interface ResultViewProps {
  t: (f: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  loadMore: () => void;
  results?: { battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[];
  style?: StyleProp<ViewStyle>;
}
interface DisplayProps {
  battle?: VsHistoryDetail;
  coop?: CoopHistoryDetail;
}

const ResultView = (props: ResultViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [display, setDisplay] = useState<DisplayProps | undefined>(undefined);
  const [displayResult, setDisplayResult] = useState(false);
  const [displayBattle, setDisplayBattle] = useState(false);
  const [displayCoop, setDisplayCoop] = useState(false);

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
  const formatTeams = (battle: VsHistoryDetail) => {
    let teams = [battle.vsHistoryDetail.myTeam, ...battle.vsHistoryDetail.otherTeams];
    teams.sort((a, b) => {
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
          return String(team.result.score!);
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
  const onDisplayCoopClose = () => {
    setDisplayCoop(false);
  };
  const onShowRawResultPress = () => {
    setDisplayBattle(false);
    setDisplayCoop(false);
    setTimeout(() => {
      setDisplayResult(true);
    }, 500);
  };

  return (
    <VStack style={[ViewStyles.px4, { width: "100%" }, props.style]}>
      {(() => {
        if (props.results) {
          return props.results.map((result, i) => {
            if (result.battle) {
              return (
                <BattleButton
                  key={result.battle.vsHistoryDetail.id}
                  isFirst={i === 0}
                  isLast={false}
                  color={getVsModeColor(result.battle.vsHistoryDetail.vsMode, accentColor)!}
                  result={getVsJudgement(result.battle)}
                  rule={t(result.battle.vsHistoryDetail.vsRule.id)}
                  stage={t(result.battle.vsHistoryDetail.vsStage.id)}
                  weapon={t(getVsSelfPlayer(result.battle).weapon.id)}
                  kill={getVsSelfPlayer(result.battle).result?.kill}
                  assist={getVsSelfPlayer(result.battle).result?.assist}
                  death={getVsSelfPlayer(result.battle).result?.death}
                  special={getVsSelfPlayer(result.battle).result?.special}
                  onPress={() => {
                    setDisplay({ battle: result.battle! });
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
                powerEgg={result.coop!.coopHistoryDetail.myResult.deliverCount}
                assistGoldenEgg={result.coop!.coopHistoryDetail.myResult.goldenAssistCount}
                deliverGoldenEgg={result.coop!.coopHistoryDetail.myResult.goldenDeliverCount}
                onPress={() => {
                  setDisplay({ coop: result.coop! });
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
            !props.results || props.results.length > 0 ? undefined : ViewStyles.rt,
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
        {display && (
          <JSONTree
            theme="monokai"
            invertTheme={false}
            data={display.battle?.vsHistoryDetail ?? display.coop!.coopHistoryDetail}
            hideRoot
            skipKeys={[
              "__typename",
              "__isGear",
              "__isPlayer",
              "id",
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
      <Modal isVisible={displayBattle} onClose={onDisplayBattleClose} style={ViewStyles.modal2d}>
        {display?.battle &&
          formatTeams(display.battle).map((team, i) => (
            <VStack flex center key={i} style={ViewStyles.mb2}>
              <HStack center style={ViewStyles.mb1}>
                <Circle size={12} color={getTeamColor(team)} style={ViewStyles.mr1} />
                <Text numberOfLines={1} style={[TextStyles.b, { color: getTeamColor(team) }]}>
                  {team.festTeamName ?? ""}
                </Text>
                <HStack flex center reverse>
                  <Text numberOfLines={1} style={[TextStyles.b, { color: getTeamColor(team) }]}>
                    {formatTeamResult(team)}
                  </Text>
                </HStack>
              </HStack>
              {team.players.map((player, i, players) => (
                <BattlePlayerButton
                  key={i}
                  isFirst={i === 0}
                  isLast={i === players.length - 1}
                  name={player.name}
                  weapon={t(player.weapon.id)}
                  paint={player.paint}
                  kill={player.result?.kill}
                  assist={player.result?.assist}
                  death={player.result?.death}
                  special={player.result?.special}
                  style={{ alignItems: "center" }}
                />
              ))}
            </VStack>
          ))}
        <Button style={{ backgroundColor: accentColor }} onPress={onShowRawResultPress}>
          <Text numberOfLines={1} style={reverseTextColor}>
            {t("show_raw_result")}
          </Text>
        </Button>
      </Modal>
      <Modal
        isVisible={displayCoop}
        onClose={onDisplayCoopClose}
        style={[ViewStyles.modal2d, { paddingHorizontal: 0 }]}
      >
        {display?.coop && (
          <VStack style={ViewStyles.mb2}>
            {display.coop.coopHistoryDetail.waveResults.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ViewStyles.mb2}>
                <HStack center style={ViewStyles.px4}>
                  {display.coop.coopHistoryDetail.waveResults
                    .slice(0, 3)
                    .map((waveResult, i, waveResults) => (
                      <WaveBox
                        key={i}
                        color={
                          getCoopIsWaveClear(display.coop!, i)
                            ? getCoopRuleColor(display.coop!.coopHistoryDetail.rule)!
                            : undefined
                        }
                        waterLevel={formatWaterLevel(waveResult)!}
                        eventWave={formatEventWave(waveResult)}
                        deliver={waveResult.teamDeliverCount!}
                        quota={waveResult.deliverNorm!}
                        appearance={waveResult.goldenPopCount}
                        style={i !== waveResults.length - 1 ? ViewStyles.mr2 : undefined}
                      />
                    ))}
                </HStack>
              </ScrollView>
            )}
            {display.coop.coopHistoryDetail.enemyResults.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ViewStyles.mb2}>
                <HStack center style={ViewStyles.px4}>
                  {display.coop.coopHistoryDetail.enemyResults.map(
                    (enemyResult, i, enemyResults) => (
                      <BossSalmonidBox
                        key={i}
                        color={
                          enemyResult.teamDefeatCount === enemyResult.popCount
                            ? getCoopRuleColor(display.coop!.coopHistoryDetail.rule)!
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
                display.coop.coopHistoryDetail.myResult,
                ...display.coop.coopHistoryDetail.memberResults,
              ].map((memberResult, i, memberResults) => (
                <CoopPlayerButton
                  key={i}
                  isFirst={i === 0}
                  isLast={i === memberResults.length - 1}
                  name={memberResult.player.name}
                  subtitle={`${t("boss_salmonids")} x${memberResult.defeatEnemyCount}`}
                  deliverGoldenEgg={memberResult.goldenDeliverCount}
                  assistGoldenEgg={memberResult.goldenAssistCount}
                  powerEgg={memberResult.deliverCount}
                  rescue={memberResult.rescueCount}
                  rescued={memberResult.rescuedCount}
                />
              ))}
            </VStack>
          </VStack>
        )}
        <VStack style={ViewStyles.px4}>
          <Button style={{ backgroundColor: accentColor }} onPress={onShowRawResultPress}>
            <Text numberOfLines={1} style={reverseTextColor}>
              {t("show_raw_result")}
            </Text>
          </Button>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default ResultView;
