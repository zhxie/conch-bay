import { useMemo, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { BadgeButton, Center, Color, HStack, Modal, ViewStyles, XBox } from "../components";
import t from "../i18n";

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

  const onXPress = () => {
    setX(true);
  };
  const onXClose = () => {
    setX(false);
  };

  return (
    <Center style={props.style}>
      <BadgeButton color={Color.XBattle} title={`${maxPower}`} onPress={onXPress} />
      <Modal isVisible={x} onClose={onXClose} style={[ViewStyles.modal1d, ViewStyles.px3]}>
        <HStack center justify style={ViewStyles.mb2}>
          <Center style={[ViewStyles.px1, { width: "50%" }]}>
            <XBox name={t("splat_zones")} power={props.splatZones || undefined} />
          </Center>
          <Center style={[ViewStyles.px1, { width: "50%" }]}>
            <XBox name={t("tower_control")} power={props.towerControl || undefined} />
          </Center>
        </HStack>
        <HStack center justify>
          <Center style={[ViewStyles.px1, { width: "50%" }]}>
            <XBox name={t("rainmaker")} power={props.rainmaker || undefined} />
          </Center>
          <Center style={[ViewStyles.px1, { width: "50%" }]}>
            <XBox name={t("clam_blitz")} power={props.clamBlitz || undefined} />
          </Center>
        </HStack>
      </Modal>
    </Center>
  );
};

export default XView;
