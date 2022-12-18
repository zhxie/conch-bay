import { useState } from "react";
import { StyleProp, useColorScheme, ViewStyle } from "react-native";
import JSONTree from "react-native-json-tree";
import {
  BattleButton,
  BattlePlayerButton,
  Button,
  Circle,
  CoopButton,
  HStack,
  Modal,
  Text,
  TextStyles,
  VStack,
  ViewStyles,
} from "../components";
import { Color, CoopHistoryDetail, VsHistoryDetail, VsTeam } from "../models";
import {
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
  const formatIsWaveClear = (coop: CoopHistoryDetail) => {
    if (coop.coopHistoryDetail.resultWave === 0) {
      if (coop.coopHistoryDetail.bossResult) {
        return coop.coopHistoryDetail.bossResult.hasDefeatBoss;
      }
      return true;
    }
    return false;
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

  const onDisplayResultClose = () => {
    setDisplayResult(false);
  };
  const onDisplayBattleClose = () => {
    setDisplayBattle(false);
  };
  const onShowRawResultPress = () => {
    setDisplayBattle(false);
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
                wave={formatWave(result.coop!)!}
                isWaveClear={formatIsWaveClear(result.coop!)}
                hazardLevel={formatHazardLevel(result.coop!)}
                deliverCount={result.coop!.coopHistoryDetail.myResult.deliverCount}
                goldenAssistCount={result.coop!.coopHistoryDetail.myResult.goldenAssistCount}
                goldenDeliverCount={result.coop!.coopHistoryDetail.myResult.goldenDeliverCount}
                onPress={() => {
                  setDisplay({ coop: result.coop! });
                  setDisplayResult(true);
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
              {team.players.map((player, i) => (
                <BattlePlayerButton
                  key={i}
                  isFirst={i === 0}
                  isLast={i === team.players.length - 1}
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
    </VStack>
  );
};

export default ResultView;
