import { StyleProp, ViewStyle } from "react-native";
import Image, { ImageSource } from "./Image";
import ResultButton from "./ResultButton";
import { Circle } from "./Shape";
import { Center, HStack } from "./Stack";
import { Color, ViewStyles, useTheme } from "./Styles";
import Text from "./Text";

interface BattlePlayerButtonProps {
  first?: boolean;
  last?: boolean;
  team: string;
  self?: boolean;
  name: string;
  weapon: ImageSource;
  subWeapon: ImageSource;
  specialWeapon: ImageSource;
  paint: number;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number | null;
  crown?: boolean;
  dragon?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattlePlayerButton = (props: BattlePlayerButtonProps) => {
  const theme = useTheme();
  const backgroundColor =
    theme.colorScheme === "light" ? `${Color.MiddleTerritory}1f` : Color.DarkBackground;

  const killAndAssist =
    props.kill === undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}(${props.assist})`
      : props.kill;

  return (
    <ResultButton
      color={props.crown ? Color.AnarchyBattle : props.dragon}
      first={props.first}
      last={props.last}
      tag={props.self ? props.team : undefined}
      image={props.weapon}
      icon={props.crown ? "crown" : props.dragon ? "party-popper" : undefined}
      title={props.name}
      subtitle={`${props.paint} pt`}
      subChildren={
        <HStack center>
          <Center style={ViewStyles.mr1}>
            <Circle size={20} color={backgroundColor} style={ViewStyles.r1} />
            <Image
              source={props.subWeapon}
              style={[ViewStyles.transparent, { width: 15, height: 15, position: "absolute" }]}
            />
          </Center>
          <Center>
            <Circle size={20} color={backgroundColor} style={ViewStyles.r1} />
            <Image
              source={props.specialWeapon}
              style={[ViewStyles.transparent, { width: 15, height: 15, position: "absolute" }]}
            />
          </Center>
        </HStack>
      }
      style={props.style}
      onPress={props.onPress}
    >
      <HStack center>
        {props.ultraSignal !== undefined && props.ultraSignal !== null && (
          <HStack center style={ViewStyles.mr1}>
            <Circle size={10} color={Color.UltraSignal} style={ViewStyles.mr1} />
            <Text numberOfLines={1}>{props.ultraSignal}</Text>
          </HStack>
        )}
        <Circle size={10} color={Color.KillAndRescue} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {killAndAssist}
        </Text>
        <Circle size={10} color={Color.Death} style={ViewStyles.mr1} />
        <Text numberOfLines={1} style={ViewStyles.mr1}>
          {props.death ?? "-"}
        </Text>
        <Circle size={10} color={Color.Special} style={ViewStyles.mr1} />
        <Text numberOfLines={1}>{props.special ?? "-"}</Text>
      </HStack>
    </ResultButton>
  );
};

export default BattlePlayerButton;
