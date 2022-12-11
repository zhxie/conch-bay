import { Feather } from "@expo/vector-icons";
import { Button, Center, HStack, Icon, Skeleton, Spacer, Text, VStack } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";

interface ResultButtonProps {
  color: ColorType;
  isLoaded: boolean;
  isFirst: boolean;
  isLast: boolean;
  result: number;
  title: string;
  subtitle: string;
  subChildren?: JSX.Element;
  onPress?: () => void;
  children?: JSX.Element;
}

const ResultButton = (props: ResultButtonProps) => {
  return (
    <Button
      w="full"
      py={0}
      colorScheme="gray"
      variant="default"
      onPress={props.onPress}
      roundedTop={props.isFirst ? "lg" : "none"}
      roundedBottom={props.isLast ? "lg" : "none"}
      _stack={{ flex: 1 }}
      _box={{ flex: 1 }}
    >
      <HStack
        flex={1}
        h={16}
        py={2}
        space={3}
        alignItems="center"
        borderBottomWidth="1"
        borderBottomColor="gray.300"
        _dark={{
          borderBottomColor: "gray.500",
        }}
      >
        <Skeleton w={8} h={8} rounded="full" isLoaded={props.isLoaded}>
          {(() => {
            if (props.result > 0) {
              return (
                <Center size={8}>
                  <Icon as={Feather} name="circle" size={7} color={props.color} />
                </Center>
              );
            } else if (props.result === 0) {
              return <Icon as={Feather} name="minus" size={8} />;
            } else {
              return <Icon as={Feather} name="x" size={8} />;
            }
          })()}
        </Skeleton>
        <VStack flex={1}>
          <HStack flex={1} space={1} alignItems="center">
            <HStack space={2} alignItems="center">
              <Skeleton.Text lines={1} isLoaded={props.isLoaded}>
                <Text bold fontSize="md" color={props.color} noOfLines={1}>
                  {props.title}
                </Text>
              </Skeleton.Text>
            </HStack>
            <Spacer />
            {props.isLoaded && props.subChildren}
          </HStack>
          <HStack flex={1} space={1} alignItems="center">
            <Skeleton.Text lines={1} isLoaded={props.isLoaded}>
              <Text fontSize="sm" lineHeight="sm" noOfLines={1}>
                {props.subtitle}
              </Text>
            </Skeleton.Text>
            <Spacer />
            {props.isLoaded && props.children}
          </HStack>
        </VStack>
      </HStack>
    </Button>
  );
};

export default ResultButton;
