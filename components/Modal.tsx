import { FlashList, ListRenderItem, MasonryFlashList } from "@shopify/flash-list";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

interface ModalBaseProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
}

const ModalBase = (props: ModalBaseProps) => {
  return (
    <ReactNativeModal
      isVisible={props.isVisible}
      backdropOpacity={0.5}
      onBackdropPress={props.onClose}
      useNativeDriverForBackdrop
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={[ViewStyles.c, props.style]}
      onModalHide={props.onModalHide}
    >
      {props.children}
    </ReactNativeModal>
  );
};

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
    <ModalBase isVisible={props.isVisible} onClose={props.onClose} onModalHide={props.onModalHide}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={onScrollEndDrag}
        onLayout={props.onLayout}
        style={[styles.panel, theme.backgroundStyle, props.style]}
      >
        <View style={styles.padding} />
        {props.children}
        <View style={styles.padding} />
      </ScrollView>
    </ModalBase>
  );
};

interface FullscreenModalProps {
  isVisible: boolean;
  onModalHide?: () => void;
  children?: React.ReactNode;
}

const FullscreenModal = (props: FullscreenModalProps) => {
  return (
    <ModalBase isVisible={props.isVisible} style={{ margin: 0 }} onModalHide={props.onModalHide}>
      {props.children}
    </ModalBase>
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
    <ModalBase isVisible={props.isVisible} onClose={props.onClose} onModalHide={props.onModalHide}>
      <VStack style={[styles.panel, theme.backgroundStyle, props.style]}>
        <FlashList
          showsHorizontalScrollIndicator={false}
          data={props.data}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          estimatedItemSize={props.estimatedItemSize}
          ListHeaderComponent={
            <VStack>
              <View style={styles.padding} />
              {props.ListHeaderComponent}
            </VStack>
          }
          ListFooterComponent={<View style={styles.padding} />}
          onScrollEndDrag={onScrollEndDrag}
        />
      </VStack>
    </ModalBase>
  );
};

interface MasonryFlashModalProps<T> extends FlashModalProps<T> {
  column: number;
}

const MasonryFlashModal = <T,>(props: MasonryFlashModalProps<T>) => {
  const theme = useTheme();

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!!props.onClose && event.nativeEvent.contentOffset.y < -80) {
      props.onClose();
    }
  };

  return (
    <ModalBase isVisible={props.isVisible} onClose={props.onClose} onModalHide={props.onModalHide}>
      <VStack style={[styles.panel, theme.backgroundStyle, props.style]}>
        <MasonryFlashList
          showsHorizontalScrollIndicator={false}
          data={props.data}
          numColumns={props.column}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          estimatedItemSize={props.estimatedItemSize}
          ListHeaderComponent={
            <VStack>
              <View style={styles.padding} />
              {props.ListHeaderComponent}
            </VStack>
          }
          ListFooterComponent={<View style={styles.padding} />}
          onScrollEndDrag={onScrollEndDrag}
        />
      </VStack>
    </ModalBase>
  );
};

const styles = StyleSheet.create({
  panel: {
    ...ViewStyles.r2,
    ...ViewStyles.px4,
  },
  padding: {
    height: 16,
  },
});

export { Modal, FullscreenModal, FlashModal, MasonryFlashModal };
