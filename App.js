import React, { useCallback, useEffect, useState } from "react";
import {
  extendTheme,
  HStack,
  NativeBaseProvider,
  ScrollView,
  useToast,
  VStack,
} from "native-base";
import ScheduleBox from "./components/ScheduleBox";
import { fetchSchedules } from "./utils/Api";
import Color from "./utils/Color";

// Auto dark mode.
const config = {
  useSystemColorMode: true,
};
const theme = extendTheme({ config: config, colors: Color });

const App = () => {
  const toast = useToast();
  const [schedules, setSchedules] = useState(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedules = await fetchSchedules();
        setSchedules(schedules);
      } catch (e) {
        toast.show({ description: e.message });
      }
    };
    fetchData();
  }, [setSchedules]);

  const schedule = useCallback(
    (mode) => {
      if (schedules === undefined) {
        return undefined;
      }
      const nodes = schedules["data"][mode]["nodes"];
      if (nodes.length === 0) {
        return null;
      }
      return nodes[0];
    },
    [schedules]
  );
  const regularSchedule = schedule("regularSchedules");
  const anarchySchedule = schedule("bankaraSchedules");
  const shift = useCallback(
    (mode) => {
      if (schedules === undefined) {
        return undefined;
      }
      const nodes = schedules["data"]["coopGroupingSchedule"][mode]["nodes"];
      if (nodes.length === 0) {
        return null;
      }
      return nodes[0];
    },
    [schedules]
  );
  const regularShift = shift("regularSchedules");

  return (
    <NativeBaseProvider theme={theme}>
      <VStack
        _dark={{ bg: "gray.900" }}
        _light={{ bg: "gray.50" }}
        flex={1}
        space={4}
        alignItems="center"
        safeArea
      >
        <ScrollView
          horizontal
          w={96}
          flexGrow="unset"
          showsHorizontalScrollIndicator="false"
        >
          <HStack space={2} px={4}>
            {regularSchedule !== null && (
              <ScheduleBox
                color="regular"
                matchSetting={regularSchedule?.["regularMatchSetting"]}
              />
            )}
            {anarchySchedule !== null && (
              <ScheduleBox
                color="anarchy"
                matchSetting={anarchySchedule?.["bankaraMatchSettings"][0]}
              />
            )}
            {anarchySchedule !== null && (
              <ScheduleBox
                color="anarchy"
                matchSetting={anarchySchedule?.["bankaraMatchSettings"][1]}
              />
            )}
            {regularShift !== null && (
              <ScheduleBox
                color="salmon"
                title="salmon_run"
                coopSetting={regularShift?.["setting"]}
              />
            )}
          </HStack>
        </ScrollView>
      </VStack>
    </NativeBaseProvider>
  );
};

export default App;
