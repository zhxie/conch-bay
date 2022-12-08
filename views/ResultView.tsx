import { Center, VStack } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import { ResultButton } from "../components";
import { Color, VsHistoryDetail } from "../models";

interface ResultViewProps {
  t: (str: string) => string;
  accentColor: ColorType;
  battles?: VsHistoryDetail[];
}

const ResultView = (props: ResultViewProps) => {
  const { t } = props;

  const getColor = (mode: string) => {
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
  const getResult = (judgement: string) => {
    switch (judgement) {
      case "WIN":
        return 1;
      case "DRAW":
      case "EXEMPTED_LOSE":
        return 0;
      case "LOSE":
      case "DEEMED_LOSE":
        return -1;
    }
  };
  const getSelf = (battle: VsHistoryDetail) => {
    return battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!;
  };

  return (
    <VStack px={4} flexGrow="unset">
      {(() => {
        if (props.battles) {
          return props.battles.map((battle, i) => {
            return (
              <ResultButton
                key={battle.vsHistoryDetail.id}
                isLoaded
                isFirst={i === 0}
                isLast={i === props.battles!.length - 1}
                color={getColor(battle.vsHistoryDetail.vsMode.id)}
                result={getResult(battle.vsHistoryDetail.judgement)!}
                rule={t(battle.vsHistoryDetail.vsRule.id)}
                stage={t(battle.vsHistoryDetail.vsStage.id)}
                weapon={t(getSelf(battle).weapon.id)}
                kill={getSelf(battle).result?.kill}
                assist={getSelf(battle).result?.assist}
                death={getSelf(battle).result?.death}
                special={getSelf(battle).result?.special}
              />
            );
          });
        } else {
          return Array(8)
            .fill(0)
            .map((_, i) => {
              return (
                <ResultButton
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
    </VStack>
  );
};

export default ResultView;
