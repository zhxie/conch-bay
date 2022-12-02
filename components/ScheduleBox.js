import { Box, CircleIcon, HStack, Skeleton, Text, VStack } from "native-base";

const ScheduleBox = (props) => {
  const { color, isLoaded, valid, title, stages } = props;

  return (
    <Box w={40} h={20} rounded="lg" _dark={{ bg: "gray.700" }} _light={{ bg: "gray.100" }}>
      <VStack p={2} flex={1}>
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
    </Box>
  );
};

export default ScheduleBox;
