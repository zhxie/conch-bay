import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack, VStack } from "./Stack";
import { Circle } from "./Shape";

interface ScheduleListProps {
  color?: string;
  title?: string;
  children?: React.ReactNode;
}

const ScheduleList = (props: ScheduleListProps) => {
  return (
    <VStack center>
      <HStack center style={ViewStyles.mb4}>
        <Circle size={12} color={props.color} style={ViewStyles.mr2} />
        <Text numberOfLines={1} style={[TextStyles.h2, { color: props.color }]}>
          {props.title}
        </Text>
      </HStack>
      <VStack flex center>
        {props.children}
      </VStack>
    </VStack>
  );
};

export default ScheduleList;
