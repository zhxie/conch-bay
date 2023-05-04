import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

interface ModalProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  onModalHide?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const theme = useTheme();

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
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={ViewStyles.c}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={onScrollEndDrag}
        onLayout={props.onLayout}
        style={[ViewStyles.r2, ViewStyles.px4, theme.backgroundStyle, props.style]}
      >
        <View style={{ height: 16 }} />
        {props.children}
        <View style={{ height: 16 }} />
      </ScrollView>
    </ReactNativeModal>
  );
};

interface FlashModalProps<T> {
  isVisible: boolean;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  estimatedItemSize: number;
  ListHeaderComponent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  onModalHide?: () => void;
}

const FlashModal = <T,>(props: FlashModalProps<T>) => {
  const theme = useTheme();

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
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={ViewStyles.c}
    >
      <VStack style={[ViewStyles.r2, ViewStyles.px4, theme.backgroundStyle, props.style]}>
        <FlashList
          showsHorizontalScrollIndicator={false}
          data={props.data}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          estimatedItemSize={props.estimatedItemSize}
          ListHeaderComponent={
            <VStack>
              <View style={{ height: 16 }} />
              {props.ListHeaderComponent}
            </VStack>
          }
          ListFooterComponent={<View style={{ height: 16 }} />}
          onScrollEndDrag={onScrollEndDrag}
        />
      </VStack>
    </ReactNativeModal>
  );
};

export { Modal, FlashModal };
