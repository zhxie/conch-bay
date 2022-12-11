import { CircleIcon, HStack, Text } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import ResultButton from "./ResultButton";

interface BattleButtonProps {
  color: ColorType;
  isLoaded: boolean;
  isFirst: boolean;
  isLast: boolean;
  result: number;
  rule: string;
  stage: string;
  weapon: string;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  onPress?: () => void;
}

const BattleButton = (props: BattleButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}<${props.assist}>`
      : props.kill;

  return (
    <ResultButton
      color={props.color}
      isLoaded={props.isLoaded}
      isFirst={props.isFirst}
      isLast={props.isLast}
      result={props.result}
      title={props.rule}
      subtitle={props.stage}
      subChildren={
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {props.weapon}
        </Text>
      }
      onPress={props.onPress}
    >
      <HStack space={1} alignItems="center">
        <CircleIcon size={2.5} color="green.500" />
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {killAndAssist}
        </Text>
        <CircleIcon size={2.5} color="red.500" />
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {props.death ?? "-"}
        </Text>
        <CircleIcon size={2.5} color="yellow.500" />
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {props.special ?? "-"}
        </Text>
      </HStack>
    </ResultButton>
  );
};

export default BattleButton;
