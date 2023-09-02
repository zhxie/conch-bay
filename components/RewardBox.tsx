import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import Marquee from "./Marquee";
import { Circle } from "./Shape";
import { Center, HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface RewardBoxProps {
  last?: boolean;
  isAccepted: boolean;
  level: number;
  images: ImageSource[];
  name: string;
  primaryAbilities: ImageSource[];
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
}

const RewardBox = (props: RewardBoxProps) => {
  const theme = useTheme();

  return (
    <HStack
      center
      style={[
        !props.last && ViewStyles.mb2,
        ViewStyles.p3,
        { height: 128 },
        ViewStyles.r2,
        theme.territoryStyle,
        props.isAccepted && ViewStyles.disabled,
        props.style,
      ]}
    >
      <VStack flex center>
        <HStack center style={[ViewStyles.mb2, { height: 72 }]}>
          {props.images.map((image, i, images) => (
            // HACK: there may be an overflow when there is more than 2 gears in a gear pack.
            // HACK: there may be an overlap when there is multiple gears.
            <Center
              style={{
                width: images.length === 1 ? 72 : 36,
                height: images.length === 1 ? 72 : 36,
              }}
            >
              <Image
                source={image}
                contentFit="contain"
                recyclingKey={props.recyclingKey}
                style={{
                  width: images.length === 1 ? 72 : 36,
                  height: images.length === 1 ? 72 : 36,
                }}
              />
              {props.primaryAbilities[i] && (
                <Center style={{ position: "absolute", right: 0, bottom: 0 }}>
                  <Circle size={images.length === 1 ? 24 : 18} color={Color.DarkBackground} />
                  <Image
                    source={props.primaryAbilities[i]}
                    recyclingKey={props.recyclingKey}
                    style={[
                      ViewStyles.transparent,
                      {
                        width: images.length === 1 ? 20 : 15,
                        height: images.length === 1 ? 20 : 15,
                        position: "absolute",
                      },
                    ]}
                  />
                </Center>
              )}
            </Center>
          ))}
        </HStack>
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
