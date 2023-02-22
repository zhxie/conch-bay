import { StyleProp, ViewStyle } from "react-native";
import Badge from "./Badge";
import Icon from "./Icon";
import Image, { SourceProps } from "./Image";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

interface ResultButtonProps {
  color?: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  image?: SourceProps;
  result?: number;
  icon?: string;
  title: string;
  badge?: string;
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
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <HStack
        flex
        center
        style={[
          ViewStyles.py2,
          !props.isFirst && ViewStyles.sept,
          !props.isLast && ViewStyles.sepb,
        ]}
      >
        {props.result !== undefined && (
          <Center style={[ViewStyles.mr3, { width: 32, height: 32 }]}>
            {(() => {
              switch (props.result) {
                case 1:
                  return (
                    <Icon name="circle" size={28} color={props.color ?? Color.MiddleTerritory} />
                  );
                case 0:
                  return <Icon name="minus" size={32} color={Color.MiddleTerritory} />;
                case -1:
                  return <Icon name="x" size={32} color={Color.MiddleTerritory} />;
                case -2:
                  return <Icon name="x-circle" size={28} color={Color.MiddleTerritory} />;
              }
            })()}
          </Center>
        )}
        {!!props.image && (
          <Image source={props.image} style={[ViewStyles.mr3, { width: 32, height: 32 }]} />
        )}
        <VStack flex>
          <HStack flex center justify>
            <HStack flex center style={ViewStyles.mr1}>
              {props.icon && (
                <Icon
                  // HACK: forcly cast.
                  name={props.icon as any}
                  size={16}
                  color={props.color}
                  style={ViewStyles.mr1}
                />
              )}
              <HStack center style={[!!props.badge && ViewStyles.mr1, ViewStyles.i]}>
                <Marquee style={[TextStyles.h2, !!props.color && { color: props.color }]}>
                  {props.title}
                </Marquee>
              </HStack>
              {props.badge && (
                <Badge
                  color={props.color ?? Color.MiddleTerritory}
                  title={props.badge}
                  size="small"
                />
              )}
            </HStack>
            <HStack center>{props.subChildren}</HStack>
          </HStack>
          <HStack flex center justify>
            <HStack flex center style={ViewStyles.mr1}>
              <Marquee>{props.subtitle}</Marquee>
            </HStack>
            <HStack center>{props.children}</HStack>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
};

export default ResultButton;
