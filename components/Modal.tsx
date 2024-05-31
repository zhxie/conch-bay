import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

const MAX_WIDTH = 648;

interface ModalBaseProps {
  isVisible: boolean;
  fullscreen?: boolean;
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
      onBackButtonPress={props.onClose}
      useNativeDriverForBackdrop
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={[props.fullscreen && { margin: 0 }, ViewStyles.c, props.style]}
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

  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!!props.onClose && event.nativeEvent.contentOffset.y < -80) {
      props.onClose();
    }
  };

  return (
    <ModalBase
      isVisible={props.isVisible}
      fullscreen={dimensions.width <= MAX_WIDTH}
      onClose={props.onClose}
      onModalHide={props.onModalHide}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={onScrollEndDrag}
        onLayout={props.onLayout}
        style={[
          dimensions.width <= MAX_WIDTH ? styles.panel : styles.fullscreenPanel,
          theme.backgroundStyle,
          props.style,
        ]}
      >
        <View style={styles.padding} />
        {props.children}
        <View
          style={{
            height: Math.max(insets.bottom, styles.padding.height),
          }}
        />
      </ScrollView>
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

  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!!props.onClose && event.nativeEvent.contentOffset.y < -80) {
      props.onClose();
    }
  };

  return (
    <ModalBase
      fullscreen={dimensions.width <= MAX_WIDTH}
      isVisible={props.isVisible}
      onClose={props.onClose}
      onModalHide={props.onModalHide}
    >
      <VStack
        style={[
          dimensions.width <= MAX_WIDTH ? styles.panel : styles.fullscreenPanel,
          theme.backgroundStyle,
          props.style,
        ]}
      >
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
          ListFooterComponent={
            <View
              style={{
                height: Math.max(insets.bottom, styles.padding.height),
              }}
            />
          }
          onScrollEndDrag={onScrollEndDrag}
        />
      </VStack>
    </ModalBase>
  );
};

const styles = StyleSheet.create({
  panel: {
    maxWidth: MAX_WIDTH,
    ...ViewStyles.rt2,
    ...ViewStyles.px4,
  },
  fullscreenPanel: {
    maxWidth: MAX_WIDTH,
    ...ViewStyles.r2,
    ...ViewStyles.px4,
  },
  padding: {
    height: 16,
  },
});

export { ModalBase, Modal, FlashModal };
