import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface CoopPlayerButtonProps {
  first?: boolean;
  last?: boolean;
  name: string;
  subtitle: string;
  mainWeapons: ImageSource[];
  specialWeapon?: ImageSource;
  deliverGoldenEgg: number;
  assistGoldenEgg: number;
  powerEgg: number;
  rescue: number;
  rescued: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const CoopPlayerButton = (props: CoopPlayerButtonProps) => {
  const theme = useTheme();
  const backgroundColor =
    theme.colorScheme === "light" ? `${Color.MiddleTerritory}1f` : Color.DarkBackground;

  const assistGoldenEgg = props.assistGoldenEgg > 0 ? `+${props.assistGoldenEgg}` : "";

  return (
    <ResultButton
      first={props.first}
      last={props.last}
      title={props.name}
      subtitle={props.subtitle}
      subChildren={
        props.specialWeapon && (
          <HStack center>
            <HStack
              center
              style={[
                ViewStyles.mr1,
                ViewStyles.px1,
                {
                  height: 20,
                  borderRadius: 10,
                  backgroundColor,
                },
              ]}
            >
              {props.mainWeapons.map((weapon, i, weapons) => (
                <Image
                  key={i}
                  source={weapon}
                  style={[
                    i !== weapons.length - 1 && ViewStyles.mr0_5,
                    { width: 20, height: 20, backgroundColor: "transparent" },
                  ]}
                />
              ))}
            </HStack>
            <Center>
              <Circle size={20} color={backgroundColor} style={ViewStyles.r1} />
              <Image
                source={props.specialWeapon}
                style={[ViewStyles.transparent, { width: 15, height: 15, position: "absolute" }]}
              />
            </Center>
          </HStack>
        )
      }
      style={props.style}
      onPress={props.onPress}
    >
      <HStack center>
        <Circle size={10} color={Color.GoldenEgg} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.deliverGoldenEgg}
          <Text numberOfLines={1} style={TextStyles.h6}>
            {assistGoldenEgg}
          </Text>
        </Text>
        <Circle size={10} color={Color.PowerEgg} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.powerEgg}
        </Text>
        <Circle size={10} color={Color.KillAndRescue} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.rescue}
        </Text>
        <Circle size={10} color={Color.Death} style={ViewStyles.mr1} />
        <Text numberOfLines={1}>{props.rescued}</Text>
      </HStack>
    </ResultButton>
  );
};

export default CoopPlayerButton;
