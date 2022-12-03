import { AspectRatio, HStack, Image, Spacer, Text, VStack } from "native-base";

const ScheduleBox = (props) => {
  const { rule, time, stages } = props;

  return (
    <VStack flex={1} space={1} alignItems="center">
      <HStack flex={1} space={1} alignSelf="center">
        <Text bold>{rule}</Text>
        <Spacer />
        <Text color="gray.400">{time}</Text>
      </HStack>
      <HStack flex={1} space={2} alignSelf="center">
        {stages.map((stage, i) => (
          <VStack key={i} flex={1} space={1} alignItems="center">
            <AspectRatio ratio={16 / 9} w="full">
              <Image
                source={{
                  uri: stage.image,
                }}
                alt={stage.title}
                _dark={{ bg: "gray.700" }}
                _light={{ bg: "gray.100" }}
                rounded="lg"
              />
            </AspectRatio>
            <Text>{stage.title}</Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
};

export default ScheduleBox;
