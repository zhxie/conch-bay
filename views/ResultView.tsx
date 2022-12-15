import { Button, Center, Modal, Text, VStack } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import { useState } from "react";
import JSONTree from "react-native-json-tree";
import { BattleButton, CoopButton } from "../components";
import { Color, CoopBossResult, CoopHistoryDetail, VsHistoryDetail } from "../models";

interface ResultViewProps {
  t: (f: string, params?: Record<string, any>) => string;
  accentColor: ColorType;
  isLoading: boolean;
  loadMore: () => void;
  results?: { battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[];
}

const ResultView = (props: ResultViewProps) => {
  const { t } = props;

  const [display, setDisplay] = useState<any>(undefined);
  const [displayResult, setDisplayResult] = useState(false);

  const getVsModeColor = (mode: string) => {
    switch (mode) {
      case "VnNNb2RlLTE=":
        return Color.RegularBattle;
      case "VnNNb2RlLTI=":
        return Color.AnarchyBattle;
      case "VnNNb2RlLTM=":
        return Color.XBattle;
      case "VnNNb2RlLTU=":
        return Color.PrivateBattle;
      case "VnNNb2RlLTY=":
      case "VnNNb2RlLTc=":
      case "VnNNb2RlLTg=":
        return props.accentColor;
    }
  };
  const getCoopRuleColor = (rule: string) => {
    switch (rule) {
      case "REGULAR":
        return Color.SalmonRun;
      case "BIG_RUN":
        return Color.BigRun;
    }
  };
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
    <VStack px={4} flexGrow="unset">
      {(() => {
        if (props.results) {
          return props.results.map((result, i) => {
            if (result.battle) {
              return (
                <BattleButton
                  key={result.battle.vsHistoryDetail.id}
                  isLoaded
                  isFirst={i === 0}
                  isLast={false}
                  color={getVsModeColor(result.battle.vsHistoryDetail.vsMode.id)}
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
                isLoaded
                isFirst={i === 0}
                isLast={false}
                color={getCoopRuleColor(result.coop!.coopHistoryDetail.rule)}
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
                  isLoaded={false}
                  isFirst={i === 0}
                  isLast={i === 7}
                  color={props.accentColor}
                  result={0}
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
          w="full"
          h={16}
          colorScheme="gray"
          variant="default"
          isLoading={props.isLoading}
          roundedTop={!props.results || props.results.length > 0 ? "none" : "lg"}
          roundedBottom="lg"
          _stack={{
            flex: 1,
            justifyContent: "center",
          }}
          onPress={props.loadMore}
        >
          <Center>
            <Text fontSize="md">{t("load_more")}</Text>
          </Center>
        </Button>
      }
      <Modal
        isOpen={displayResult}
        onClose={onDisplayResultClose}
        avoidKeyboard
        justifyContent="flex-end"
        safeArea
        size="xl"
      >
        <Modal.Content h="xl" bg="#272822">
          <Modal.Body>
            <VStack flex={1}>
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
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

export default ResultView;
