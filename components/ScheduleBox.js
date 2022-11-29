import { Box, CircleIcon, HStack, Skeleton, Text, VStack } from "native-base";

const ScheduleBox = (props) => {
  const { t, color, valid, title, matchSetting, coopSetting } = props;

  return (
    <Box
      w={40}
      h={20}
      rounded="lg"
      _dark={{ bg: "gray.700" }}
      _light={{ bg: "gray.100" }}
    >
      <VStack p={2} flex={1}>
        <HStack space={2} alignItems="center">
          <Skeleton
            size={3}
            rounded="full"
            isLoaded={matchSetting || coopSetting}
          >
            <CircleIcon size={3} color={valid ? color : "gray.400"} />
          </Skeleton>
          <Skeleton.Text
            flex={1}
            lines={1}
            isLoaded={matchSetting || coopSetting}
          >
            <Text
              bold
              fontSize="md"
              color={valid ? color : "gray.400"}
              noOfLines={1}
            >
              {(() => {
                if (matchSetting) {
                  return title ?? t(matchSetting["vsRule"]["id"]) ?? "";
                }
                return title;
              })()}
            </Text>
          </Skeleton.Text>
        </HStack>
        <VStack direction="column-reverse" flex={1} space={1}>
          <Skeleton.Text lines={1} isLoaded={matchSetting || coopSetting}>
            {(() => {
              if (matchSetting) {
                return matchSetting["vsStages"]
                  .slice()
                  .reverse()
                  .map((stage) => (
                    <Text
                      key={stage["id"]}
                      fontSize="sm"
                      lineHeight="sm"
                      noOfLines={1}
                    >
                      {t(stage["id"])}
                    </Text>
                  ));
              } else if (coopSetting) {
                return (
                  <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                    {t(coopSetting["coopStage"]["id"])}
                  </Text>
                );
              }
            })()}
          </Skeleton.Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ScheduleBox;
