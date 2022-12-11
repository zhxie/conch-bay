import { Button, CircleIcon, HStack, Skeleton, Text, VStack } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";

interface ScheduleButtonProps {
  color: ColorType;
  isLoaded: boolean;
  isValid: boolean;
  rule: string;
  stages: string[];
  onPress?: () => void;
}

const ScheduleButton = (props: ScheduleButtonProps) => {
  return (
    <Button p={0} rounded="lg" colorScheme="gray" variant="default" onPress={props.onPress}>
      <VStack w={40} h={20} p={2}>
        <HStack space={2} alignItems="center">
          <Skeleton w={3} h={3} rounded="full" isLoaded={props.isLoaded}>
            <CircleIcon size={3} color={props.isValid ? props.color : "gray.400"} />
          </Skeleton>
          <Skeleton.Text flex={1} lines={1} isLoaded={props.isLoaded}>
            <Text bold fontSize="md" color={props.isValid ? props.color : "gray.400"} noOfLines={1}>
              {props.rule}
            </Text>
          </Skeleton.Text>
        </HStack>
        <VStack direction="column-reverse" flex={1} space={1}>
          <Skeleton.Text lines={1} isLoaded={props.isLoaded}>
            {props.stages
              .slice()
              .reverse()
              .map((stage, i) => (
                <Text key={i} fontSize="sm" lineHeight="sm" noOfLines={1}>
                  {stage}
                </Text>
              ))}
          </Skeleton.Text>
        </VStack>
      </VStack>
    </Button>
  );
};

export default ScheduleButton;