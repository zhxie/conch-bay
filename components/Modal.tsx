import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
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
  scrollTo?: (p: any) => void;
  scrollOffset?: number;
  scrollOffsetMax?: number;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  onModalHide?: () => void;
  children?: React.ReactNode;
}

const ModalBase = (props: ModalBaseProps) => {
  const { height } = useWindowDimensions();

  return (
    <ReactNativeModal
      isVisible={props.isVisible}
      // Fix react-native-modal/react-native-modal#571.
      deviceHeight={height + (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0)}
      backdropOpacity={0.5}
      onBackdropPress={props.onClose}
      onBackButtonPress={props.onClose}
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      statusBarTranslucent
      propagateSwipe
      swipeDirection="down"
      onSwipeComplete={props.onClose}
      scrollTo={props.scrollTo}
      scrollOffset={props.scrollOffset}
      scrollOffsetMax={props.scrollOffsetMax}
      style={[
        props.fullscreen && { justifyContent: "flex-end", margin: 0 },
        // ViewStyles.c,
        props.style,
      ]}
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

  const [scrollHeight, setScrollHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [offset, setOffset] = useState(0);

  const ref = useRef<ScrollView>(null);

  const scrollTo = (p: { animated: boolean; y: number }) => {
    ref.current?.scrollTo(p);
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffset(event.nativeEvent.contentOffset.y);
  };
  const onLayout = (event: LayoutChangeEvent) => {
    setScrollHeight(event.nativeEvent.layout.height);
    props.onLayout?.(event);
  };
  const onContentSizeChange = (_width: number, height: number) => {
    setContentHeight(height);
  };

  return (
    <ModalBase
      isVisible={props.isVisible}
      fullscreen={dimensions.width <= MAX_WIDTH}
      scrollTo={scrollTo}
      scrollOffset={offset}
      scrollOffsetMax={contentHeight - scrollHeight}
      onClose={props.onClose}
      onModalHide={props.onModalHide}
    >
      <ScrollView
        ref={ref}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
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

  const [scrollHeight, setScrollHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [offset, setOffset] = useState(0);

  const ref = useRef<FlashList<any>>(null);

  const scrollTo = (p: { animated: boolean; y: number }) => {
    ref.current?.scrollToOffset({ animated: p.animated, offset: p.y });
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffset(event.nativeEvent.contentOffset.y);
  };
  const onLayout = (event: LayoutChangeEvent) => {
    setScrollHeight(event.nativeEvent.layout.height);
  };
  const onContentSizeChange = (_width: number, height: number) => {
    setContentHeight(height);
  };

  return (
    <ModalBase
      isVisible={props.isVisible}
      fullscreen={dimensions.width <= MAX_WIDTH}
      scrollTo={scrollTo}
      scrollOffset={offset}
      scrollOffsetMax={contentHeight - scrollHeight}
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
          ref={ref}
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
          scrollEventThrottle={16}
          onScroll={onScroll}
          onLayout={onLayout}
          onContentSizeChange={onContentSizeChange}
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
