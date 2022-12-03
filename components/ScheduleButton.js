import { Button, CircleIcon, HStack, Skeleton, Text, VStack } from "native-base";

const ScheduleButton = (props) => {
  const { color, isLoaded, valid, title, stages, onPress } = props;

  return (
    <Button p={0} rounded="lg" colorScheme="gray" variant="default" onPress={onPress}>
      <VStack w={40} h={20} p={2}>
        <HStack space={2} alignItems="center">
          <Skeleton size={3} rounded="full" isLoaded={isLoaded}>
            <CircleIcon size={3} color={valid ? color : "gray.400"} />
          </Skeleton>
          <Skeleton.Text flex={1} lines={1} isLoaded={isLoaded}>
            <Text bold fontSize="md" color={valid ? color : "gray.400"} noOfLines={1}>
              {title}
            </Text>
          </Skeleton.Text>
        </HStack>
        <VStack direction="column-reverse" flex={1} space={1}>
          <Skeleton.Text lines={1} isLoaded={isLoaded}>
            {stages
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
