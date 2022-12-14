import { StyleProp, ViewStyle } from "react-native";
import ResultButton from "./ResultButton";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";
import { HStack } from "./Stack";
import { Circle } from "./Shape";

interface WeaponProps {
  image: string;
  cacheKey: string;
}
interface BattlePlayerButtonProps {
  isFirst?: boolean;
  isLast?: boolean;
  name: string;
  weapon: WeaponProps;
  paint: number;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number | null;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const BattlePlayerButton = (props: BattlePlayerButtonProps) => {
  const killAndAssist =
    props.kill == undefined
      ? "-"
      : props.assist! > 0
      ? `${props.kill}(${props.assist})`
      : props.kill;

  return (
    <ResultButton
      isFirst={props.isFirst}
      isLast={props.isLast}
      image={{ uri: props.weapon.image, cacheKey: props.weapon.cacheKey }}
      title={props.name}
      subtitle={`${props.paint} pt`}
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
