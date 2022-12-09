import {
  Button,
  Center,
  CheckIcon,
  CircleIcon,
  CloseIcon,
  HStack,
  MinusIcon,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";

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
    <Button
      w="full"
      py={0}
      colorScheme="gray"
      variant="default"
      onPress={props.onPress}
      roundedTop={props.isFirst ? "lg" : "none"}
      roundedBottom={props.isLast ? "lg" : "none"}
      _stack={{ flex: 1 }}
      _box={{ flex: 1 }}
    >
      <HStack flex={1} h={16} py={2} space={3} alignItems="center">
        <Skeleton w={8} h={8} rounded="full" isLoaded={props.isLoaded}>
          {(() => {
            if (props.result > 0) {
              return <CheckIcon size={8} color={props.color} />;
            } else if (props.result === 0) {
              return <MinusIcon size={8} />;
            } else {
              return (
                <Center boxSize={8}>
                  <CloseIcon size={7} />
                </Center>
              );
            }
          })()}
        </Skeleton>
        <VStack flex={1}>
          <HStack flex={1} space={1} alignItems="center">
            <HStack space={2} alignItems="center">
              <Skeleton.Text lines={1} isLoaded={props.isLoaded}>
                <Text bold fontSize="md" color={props.color} noOfLines={1}>
                  {props.rule}
                </Text>
              </Skeleton.Text>
            </HStack>
            <Spacer />
            {props.isLoaded && (
              <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                {props.weapon}
              </Text>
            )}
          </HStack>
          <HStack flex={1} space={1} alignItems="center">
            <Skeleton.Text lines={1} isLoaded={props.isLoaded}>
              <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                {props.stage}
              </Text>
            </Skeleton.Text>
            <Spacer />
            {props.isLoaded && (
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
            )}
          </HStack>
        </VStack>
      </HStack>
    </Button>
  );
};

export default BattleButton;
