import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface RewardBoxProps {
  isLast?: boolean;
  isAccepted: boolean;
  level: number;
  image: ImageSource;
  name: string;
  primaryAbility?: ImageSource;
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
}

const RewardBox = (props: RewardBoxProps) => {
  const theme = useTheme();

  return (
    <HStack
      center
      style={[
        !props.isLast && ViewStyles.mb2,
        ViewStyles.p3,
        { height: 128 },
        ViewStyles.r2,
        theme.territoryStyle,
        props.isAccepted && ViewStyles.disabled,
        props.style,
      ]}
    >
      <VStack flex center>
        <Center style={[ViewStyles.mb2, { width: 72, height: 72 }]}>
          <Image
            source={props.image}
            contentFit="contain"
            recyclingKey={props.recyclingKey}
            style={{ width: 72, height: 72 }}
          />
          {props.primaryAbility && (
            <Center style={{ position: "absolute", right: 0, bottom: 0 }}>
              <Circle size={24} color={Color.DarkBackground} />
              <Image
                source={props.primaryAbility}
                recyclingKey={props.recyclingKey}
                style={[ViewStyles.transparent, { width: 20, height: 20, position: "absolute" }]}
              />
            </Center>
          )}
        </Center>
        <HStack>
          <Marquee>
            <Text style={TextStyles.subtle}>{props.level} </Text>
            {props.name}
          </Marquee>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default RewardBox;
