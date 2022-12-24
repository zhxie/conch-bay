import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { Center, HStack, VStack } from "./Stack";
import { Circle } from "./Shape";

interface TitledListProps {
  color?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const TitledList = (props: TitledListProps) => {
  return (
    <VStack center>
      <HStack center style={props.subtitle ? ViewStyles.mb2 : ViewStyles.mb4}>
        <Circle size={12} color={props.color} style={ViewStyles.mr2} />
        <Text numberOfLines={1} style={[TextStyles.h2, { color: props.color }]}>
          {props.title}
        </Text>
      </HStack>
      {props.subtitle && (
        <Center style={ViewStyles.mb2}>
          <Text center>{props.subtitle}</Text>
        </Center>
      )}
      <VStack center style={ViewStyles.wf}>
        {props.children}
      </VStack>
    </VStack>
  );
};

export default TitledList;
