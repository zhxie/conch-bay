import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { ViewStyles } from "./Styles";

interface ModalProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!!props.onClose && event.nativeEvent.contentOffset.y < -80) {
      props.onClose();
    }
  };

  return (
    <ReactNativeModal
      isVisible={props.isVisible}
      backdropOpacity={0.5}
      onBackdropPress={props.onClose}
      onModalHide={props.onModalHide}
      useNativeDriverForBackdrop
      style={ViewStyles.c}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={onScrollEndDrag}
        style={[ViewStyles.r2, ViewStyles.px4, style, props.style]}
      >
        <View style={{ height: 16 }} />
        {props.children}
        <View style={{ height: 16 }} />
      </ScrollView>
    </ReactNativeModal>
  );
};

export default Modal;
