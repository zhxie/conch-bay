import { Feather } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";
import { Color } from "../models";
import Pressable from "./Pressable";
import { TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";
import { Center, HStack, VStack } from "./Stack";

interface ResultButtonProps {
  color?: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
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
        {props.result !== undefined && (
          <Center style={[ViewStyles.mr3, { width: 32, height: 32 }]}>
            {(() => {
              if (props.result > 0) {
                return (
                  <Feather name="circle" size={28} color={props.color ?? Color.MiddleTerritory} />
                );
              } else if (props.result === 0) {
                return <Feather name="minus" size={32} color={Color.MiddleTerritory} />;
              } else {
                return <Feather name="x" size={32} color={Color.MiddleTerritory} />;
              }
            })()}
          </Center>
        )}
        <VStack flex center>
          <HStack flex center>
            <Text
              numberOfLines={1}
              style={[TextStyles.h2, props.color !== undefined && { color: props.color }]}
            >
              {props.title}
            </Text>
            <HStack flex center reverse>
              {props.subChildren}
            </HStack>
          </HStack>
          <HStack flex center>
            <Text numberOfLines={1}>{props.subtitle}</Text>
            <HStack flex center reverse>
              {props.children}
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
};

export default ResultButton;
