import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

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
        <Marquee style={[TextStyles.h2, { color: props.color }]}>{props.title}</Marquee>
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
