import { StyleProp, ViewStyle } from "react-native";
import { genericMemo } from "../utils/memo";
import Image, { ImageSource } from "./Image";
import ResultButton from "./ResultButton";
import { HStack } from "./Stack";
import { Color, TextStyles, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface CoopRotationButtonProps<T> {
  stats?: T;
  color: string;
  first?: boolean;
  last?: boolean;
  rule: string;
  time: string;
  stage: string;
  weapons: ImageSource[];
  style?: StyleProp<ViewStyle>;
  onPress?: (stats: T) => void;
}

const CoopRotationButton = <T,>(props: CoopRotationButtonProps<T>) => {
  const theme = useTheme();
  const backgroundColor =
    theme.colorScheme === "light" ? `${Color.MiddleTerritory}1f` : Color.DarkBackground;

  const onPress = () => {
    if (props.stats && props.onPress) {
      props.onPress(props.stats);
    }
  };

  return (
    <ResultButton
      color={props.color}
      first={props.first}
      last={props.last}
      title={props.rule}
      subtitle={props.stage}
      subChildren={
        <Text numberOfLines={1} style={TextStyles.subtle}>
          {props.time}
        </Text>
      }
      style={props.style}
      onPress={onPress}
    >
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
        {props.weapons.map((weapon, i, weapons) => (
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
    </ResultButton>
  );
};

export default genericMemo(CoopRotationButton);
