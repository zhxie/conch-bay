import { CircleIcon, HStack, Text } from "native-base";
import { ColorType } from "native-base/src/components/types";
import ResultButton from "./ResultButton";

interface CoopButtonProps {
  color: ColorType;
  isLoaded: boolean;
  isFirst: boolean;
  isLast: boolean;
  result: number;
  rule: string;
  stage: string;
  wave: string;
  isWaveClear: boolean;
  deliverCount: number;
  goldenAssistCount: number;
  goldenDeliverCount: number;
  onPress?: () => void;
}

const CoopButton = (props: CoopButtonProps) => {
  const goldenCount =
    props.goldenAssistCount! > 0
      ? `${props.goldenDeliverCount}<${props.goldenAssistCount}>`
      : props.goldenDeliverCount;

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
        <Text
          bold={props.isWaveClear}
          color={props.isWaveClear ? props.color : undefined}
          fontSize="sm"
          lineHeight="sm"
          noOfLines={1}
        >
          {props.wave}
        </Text>
      }
      onPress={props.onPress}
    >
      <HStack space={1} alignItems="center">
        <CircleIcon size={2.5} color="yellow.300" />
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {goldenCount}
        </Text>
        <CircleIcon size={2.5} color="orange.500" />
        <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
          {props.deliverCount}
        </Text>
      </HStack>
    </ResultButton>
  );
};

export default CoopButton;
