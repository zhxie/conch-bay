import { useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { BadgeButton, Center, Color, HStack, Modal, ViewStyles, XBox } from "../components";
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
    [props.splatZones, props.towerControl, props.rainmaker, props.clamBlitz]
  );

  const formatPower = (power: number) => {
    if (power > 0) {
      return roundPower(power);
    }
    return undefined;
  };

  const onXPress = () => {
    setX(true);
  };
  const onXClose = () => {
    setX(false);
  };

  return (
    <Center style={props.style}>
      <BadgeButton color={Color.XBattle} title={`${maxPower}`} onPress={onXPress} />
      <Modal isVisible={x} onClose={onXClose} style={[ViewStyles.modal1d, ViewStyles.px4]}>
        <HStack center justify style={ViewStyles.mb2}>
          <XBox
            name={t("splat_zones")}
            power={formatPower(props.splatZones)}
            style={ViewStyles.mr2}
          />
          <XBox name={t("tower_control")} power={formatPower(props.towerControl)} />
        </HStack>
        <HStack center justify>
          <XBox name={t("rainmaker")} power={formatPower(props.rainmaker)} style={ViewStyles.mr2} />
          <XBox name={t("clam_blitz")} power={formatPower(props.clamBlitz)} />
        </HStack>
      </Modal>
    </Center>
  );
};

export default XView;
