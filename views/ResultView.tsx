import { useState } from "react";
import { ActivityIndicator, StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";
import JSONTree from "react-native-json-tree";
import { BattleButton, Button, CoopButton, Modal, TextStyles, ViewStyles } from "../components";
import { Color, CoopBossResult, CoopHistoryDetail, VsHistoryDetail } from "../models";
import { getCoopRuleColor, getVsModeColor } from "../utils/ui";

interface ResultViewProps {
  t: (f: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  loadMore: () => void;
  results?: { battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[];
  style?: StyleProp<ViewStyle>;
}

const ResultView = (props: ResultViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;
  const textStyle = colorScheme === "light" ? TextStyles.light : TextStyles.dark;

  const [display, setDisplay] = useState<any>(undefined);
  const [displayResult, setDisplayResult] = useState(false);

  const getBattleResult = (judgement: string) => {
    switch (judgement) {
      case "WIN":
        return 1;
      case "DRAW":
        return 0;
      case "LOSE":
      case "DEEMED_LOSE":
      case "EXEMPTED_LOSE":
        return -1;
    }
  };
  const getBattleSelf = (battle: VsHistoryDetail) => {
    return battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!;
  };
  const getWave = (waveResult: number, bossResult: CoopBossResult | null) => {
    switch (waveResult) {
      case -1:
        return "";
      case 1:
        return t("wave_1");
      case 2:
        return t("wave_2");
      case 3:
        return t("wave_3");
      case 0:
        if (bossResult) {
          return t("xtrawave");
        }
        return t("wave_3");
    }
  };
  const getIsWaveClear = (waveResult: number, bossResult: CoopBossResult | null) => {
    if (waveResult === 0) {
      if (bossResult) {
        return bossResult.hasDefeatBoss;
      }
      return true;
    }
    return false;
  };
  const getHazardLevel = (hazardLevel: number) => {
    if (hazardLevel > 0) {
      return `(${parseInt(String(hazardLevel * 100))}%)`;
    }
    return "";
  };

  const onDisplayResultClose = () => {
    setDisplayResult(false);
  };

  return (
    <View style={[ViewStyles.vc, ViewStyles.px4, { width: "100%" }, props.style]}>
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
                  result={getBattleResult(result.battle.vsHistoryDetail.judgement)!}
                  rule={t(result.battle.vsHistoryDetail.vsRule.id)}
                  stage={t(result.battle.vsHistoryDetail.vsStage.id)}
                  weapon={t(getBattleSelf(result.battle).weapon.id)}
                  kill={getBattleSelf(result.battle).result?.kill}
                  assist={getBattleSelf(result.battle).result?.assist}
                  death={getBattleSelf(result.battle).result?.death}
                  special={getBattleSelf(result.battle).result?.special}
                  onPress={() => {
                    setDisplay(result.battle!.vsHistoryDetail);
                    setDisplayResult(true);
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
                wave={
                  getWave(
                    result.coop!.coopHistoryDetail.resultWave,
                    result.coop!.coopHistoryDetail.bossResult
                  )!
                }
                isWaveClear={getIsWaveClear(
                  result.coop!.coopHistoryDetail.resultWave,
                  result.coop!.coopHistoryDetail.bossResult
                )}
                hazardLevel={getHazardLevel(result.coop!.coopHistoryDetail.dangerRate)}
                deliverCount={result.coop!.coopHistoryDetail.myResult.deliverCount}
                goldenAssistCount={result.coop!.coopHistoryDetail.myResult.goldenAssistCount}
                goldenDeliverCount={result.coop!.coopHistoryDetail.myResult.goldenDeliverCount}
                onPress={() => {
                  setDisplay(result.coop!.coopHistoryDetail);
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
          <Text numberOfLines={1} style={[TextStyles.h3, textStyle]}>
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
            data={display}
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
    </View>
  );
};

export default ResultView;
