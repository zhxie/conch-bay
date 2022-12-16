import { ScrollView, StyleProp, useColorScheme, View, ViewStyle } from "react-native";
import ReactNativeModal from "react-native-modal";
import { ViewStyles } from "./Styles";

interface ModalProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  return (
    <ReactNativeModal
      isVisible={props.isVisible}
      backdropOpacity={0.5}
      onBackdropPress={props.onClose}
      useNativeDriverForBackdrop
      style={ViewStyles.c}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[ViewStyles.r, ViewStyles.px4, style, props.style]}
      >
        <View style={{ height: 16 }} />
        {props.children}
        <View style={{ height: 16 }} />
      </ScrollView>
    </ReactNativeModal>
  );
};

export default Modal;
