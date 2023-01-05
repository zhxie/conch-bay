import { Feather } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { Center, HStack, VStack } from "./Stack";
import Image from "./Image";

interface ImageProps {
  uri: string;
  cacheKey: string;
}
interface ResultButtonProps {
  color?: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  image?: ImageProps;
  result?: number;
  title: string;
  subtitle: string;
  subChildren?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
}

const ResultButton = (props: ResultButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isLoading}
      style={[
        ViewStyles.px3,
        { height: 64 },
        props.isFirst && ViewStyles.rt,
        props.isLast && ViewStyles.rb,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <HStack
        flex
        center
        style={[
          ViewStyles.py2,
          !props.isLast && {
            borderBottomWidth: 1,
            borderBottomColor: `${Color.MiddleTerritory}3f`,
          },
        ]}
      >
        {!!props.result && (
          <Center style={[ViewStyles.mr3, { width: 32, height: 32 }]}>
            {(() => {
              switch (props.result) {
                case 1:
                  return (
                    <Feather name="circle" size={28} color={props.color ?? Color.MiddleTerritory} />
                  );
                case 0:
                  return <Feather name="minus" size={32} color={Color.MiddleTerritory} />;
                case -1:
                  return <Feather name="x" size={32} color={Color.MiddleTerritory} />;
                case -2:
                  return <Feather name="x-circle" size={28} color={Color.MiddleTerritory} />;
              }
            })()}
          </Center>
        )}
        {!!props.image && (
          <Image
            uri={props.image.uri}
            cacheKey={props.image.cacheKey}
            style={[ViewStyles.mr3, { width: 32, height: 32 }]}
          />
        )}
        <VStack flex>
          <HStack flex center reverse>
            <HStack center>{props.subChildren}</HStack>
            <HStack center flex style={ViewStyles.mr1}>
              <Text
                numberOfLines={1}
                style={[TextStyles.h2, !!props.color && { color: props.color }]}
              >
                {props.title}
              </Text>
            </HStack>
          </HStack>
          <HStack flex center reverse>
            <HStack center>{props.children}</HStack>
            <HStack center flex style={ViewStyles.mr1}>
              <Text numberOfLines={1}>{props.subtitle}</Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
};

export default ResultButton;
