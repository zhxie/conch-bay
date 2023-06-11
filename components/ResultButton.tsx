import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Badge } from "./Badge";
import Icon from "./Icon";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { Rectangle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

enum Result {
  Win,
  Draw,
  Lose,
  ExemptedLose,
}

interface ResultButtonProps {
  color?: string;
  isLoading?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  tag?: string;
  image?: ImageSource;
  result?: Result;
  icon?: string;
  title: string;
  badge?: string;
  subtitle: React.ReactNode;
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
      {props.tag && (
        <HStack style={[{ position: "absolute", width: 4, overflow: "hidden" }]}>
          <HStack
            style={[
              { width: 16, overflow: "hidden" },
              props.isFirst && ViewStyles.rt2,
              props.isLast && ViewStyles.rb2,
            ]}
          >
            <Rectangle width={4} height={64} color={props.tag} />
          </HStack>
        </HStack>
      )}
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
          // HACK: the right margin looks wider than the left one due to optical illusion.
          <Center style={[ViewStyles.mr2, styles.image]}>
            {(() => {
              switch (props.result) {
                case Result.Win:
                  return (
                    <Icon name="circle" size={28} color={props.color ?? Color.MiddleTerritory} />
                  );
                case Result.Draw:
                  return <Icon name="minus" size={32} color={Color.MiddleTerritory} />;
                case Result.Lose:
                  return <Icon name="x" size={32} color={Color.MiddleTerritory} />;
                case Result.ExemptedLose:
                  return <Icon name="x-circle" size={28} color={Color.MiddleTerritory} />;
              }
            })()}
          </Center>
        )}
        {!!props.image && <Image source={props.image} style={[ViewStyles.mr2, styles.image]} />}
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
              <HStack style={[!!props.badge && ViewStyles.mr1, ViewStyles.i]}>
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

const styles = StyleSheet.create({
  image: {
    width: 32,
    height: 32,
  },
});

export { Result };
export default ResultButton;
