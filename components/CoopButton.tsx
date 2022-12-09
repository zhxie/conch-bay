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
import { ColorType } from "native-base/src/components/types";

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
              <Text
                bold={props.isWaveClear}
                color={props.isWaveClear ? props.color : undefined}
                fontSize="sm"
                lineHeight="sm"
                noOfLines={1}
              >
                {props.wave}
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
                <CircleIcon size={2.5} color="yellow.300" />
                <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                  {goldenCount}
                </Text>
                <CircleIcon size={2.5} color="orange.500" />
                <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                  {props.deliverCount}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Button>
  );
};

export default CoopButton;
