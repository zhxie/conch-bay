import { StyleProp, ViewStyle } from "react-native";
import Icon, { IconName } from "./Icon";
import { VStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface CustomDialogProps {
  icon: IconName;
  children: React.ReactNode;
}

const CustomDialog = (props: CustomDialogProps) => {
  return (
    <VStack center>
      <Icon name={props.icon} size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
      {props.children}
    </VStack>
  );
};

interface DialogProps extends CustomDialogProps {
  text: string;
}

const Dialog = (props: DialogProps) => {
  return (
    <CustomDialog icon={props.icon}>
      <Text style={ViewStyles.mb4}>{props.text}</Text>
      <VStack style={ViewStyles.wf}>{props.children}</VStack>
    </CustomDialog>
  );
};

interface DialogSectionProps {
  text: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const DialogSection = (props: DialogSectionProps) => {
  return (
    <VStack style={[ViewStyles.wf, props.style]}>
      <VStack center style={ViewStyles.mb2}>
        <Text>{props.text}</Text>
      </VStack>
      {props.children}
    </VStack>
  );
};

export { CustomDialog, DialogSection };
export default Dialog;
