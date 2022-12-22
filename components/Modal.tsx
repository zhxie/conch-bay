import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { ViewStyles } from "./Styles";

interface ModalProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
  topChildren?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y < -80) {
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
        style={[ViewStyles.r, ViewStyles.px4, style, props.style]}
      >
        {props.topChildren}
        <View style={{ height: props.topChildren === undefined ? 16 : 8 }} />
        {props.children}
        <View style={{ height: 16 }} />
      </ScrollView>
    </ReactNativeModal>
  );
};

export default Modal;
