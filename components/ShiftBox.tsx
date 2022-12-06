import { AspectRatio, HStack, Image, Spacer, Text, VStack } from "native-base";

interface StageProps {
  title: string;
  image: string;
}
interface ScheduleBoxProps {
  rule: string;
  time: string;
  stage: StageProps;
  weapons: string[];
}

const ShiftBox = (props: ScheduleBoxProps) => {
  const { rule, time, stage, weapons } = props;

  return (
    <VStack flex={1} space={1} alignItems="center">
      <HStack flex={1} space={1} alignSelf="center">
        <Text bold>{rule}</Text>
        <Spacer />
        <Text color="gray.400">{time}</Text>
      </HStack>
      <HStack flex={1} space={2} alignSelf="center" alignItems="center">
        <VStack flex={1} space={1} alignItems="center">
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
        <VStack flex={1} space={1} alignItems="center">
          <HStack flex={1} alignSelf="center" alignItems="center">
            {weapons.map((weapon, i) => (
              <AspectRatio key={i} flex={1} ratio={1} w="full">
                <Image source={{ uri: weapon }} alt="" rounded="full" />
              </AspectRatio>
            ))}
          </HStack>
          <Text> </Text>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default ShiftBox;
