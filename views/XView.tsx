import { useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { BadgeButton, Center, Color, Modal, VStack, XBox } from "../components";
import t from "../i18n";
import { roundPower } from "../utils/ui";

interface XViewProps {
  splatZones: number;
  towerControl: number;
  rainmaker: number;
  clamBlitz: number;
  style?: StyleProp<ViewStyle>;
}

const XView = (props: XViewProps) => {
  const [x, setX] = useState(false);

  const maxPower = useMemo(
    () => Math.max(props.splatZones, props.towerControl, props.rainmaker, props.clamBlitz),
    [props.splatZones, props.towerControl, props.rainmaker, props.clamBlitz],
  );

  const formatPower = (power: number) => {
    if (power > 0) {
      return roundPower(power);
    }
    return "-";
  };

  const onXPress = () => {
    setX(true);
  };
  const onXDismiss = () => {
    setX(false);
  };

  return (
    <Center style={props.style}>
      <BadgeButton color={Color.XBattle} title={formatPower(maxPower)} onPress={onXPress} />
      <Modal isVisible={x} size="small" onDismiss={onXDismiss}>
        <VStack center>
          <XBox first name={t("splat_zones")} power={formatPower(props.splatZones)} />
          <XBox name={t("tower_control")} power={formatPower(props.towerControl)} />
          <XBox name={t("rainmaker")} power={formatPower(props.rainmaker)} />
          <XBox last name={t("clam_blitz")} power={formatPower(props.clamBlitz)} />
        </VStack>
      </Modal>
    </Center>
  );
};

export default XView;
