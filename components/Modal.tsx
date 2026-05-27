import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
  useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useCallback, useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

const CloseBackdrop = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      {...props}
    />
  );
};

const IgnoreBackdrop = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="none"
      {...props}
    />
  );
};

const MAX_WIDTH = 648;

const ModalSize = {
  small: 384,
  medium: 576,
  large: 672,
};

const useControlledBottomSheetModal = (isVisible: boolean, onDismiss?: () => void) => {
  const ref = useRef<BottomSheetModal>(null);
  const presentedRef = useRef(false);

  useEffect(() => {
    if (isVisible) {
      presentedRef.current = true;
      ref.current?.present();
    } else if (presentedRef.current) {
      presentedRef.current = false;
      ref.current?.dismiss();
    }
  }, [isVisible]);

  const handleDismiss = useCallback(() => {
    presentedRef.current = false;
    onDismiss?.();
  }, [onDismiss]);

  return { ref, handleDismiss };
};

interface ModalProps {
  isVisible: boolean;
  size: "small" | "medium" | "large";
  noPadding?: boolean;
  allowDismiss?: boolean;
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  const { ref, handleDismiss } = useControlledBottomSheetModal(props.isVisible, props.onDismiss);

  return (
    <BottomSheetModal
      ref={ref}
      stackBehavior="push"
      detached={width > MAX_WIDTH}
      enablePanDownToClose={props.allowDismiss ? true : false}
      enableDynamicSizing
      maxDynamicContentSize={Math.min(
        ModalSize[props.size],
        height - insets.top - (width > MAX_WIDTH ? Math.max(insets.bottom, 20) : 0),
      )}
      bottomInset={width > MAX_WIDTH ? Math.max(insets.bottom, 20) : 0}
      containerStyle={width > MAX_WIDTH && { marginHorizontal: (width - MAX_WIDTH) / 2 }}
      backgroundStyle={[
        theme.backgroundStyle,
        width > MAX_WIDTH ? styles.detachedPanel : styles.panel,
        props.style,
      ]}
      onDismiss={handleDismiss}
      handleComponent={null}
      backdropComponent={props.allowDismiss ? CloseBackdrop : IgnoreBackdrop}
    >
      <BottomSheetScrollView
        style={[
          width > MAX_WIDTH ? styles.detachedPanel : styles.panel,
          !props.noPadding && styles.padding,
        ]}
      >
        <View onLayout={props.onLayout} style={styles.inset} />
        {props.children}
        <View
          style={{
            height:
              width > MAX_WIDTH
                ? styles.inset.height
                : Math.max(insets.bottom, styles.inset.height),
          }}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

interface FlashModalProps<T> {
  isVisible: boolean;
  size: "small" | "medium" | "large";
  noPadding?: boolean;
  allowDismiss?: boolean;
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  estimatedItemSize: number;
  estimatedHeight: number;
  extraData?: unknown;
  ListHeaderComponent?: React.ReactNode;
}

const FlashModal = <T,>(props: FlashModalProps<T>) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  const { ref, handleDismiss } = useControlledBottomSheetModal(props.isVisible, props.onDismiss);

  const renderScrollComponent = useBottomSheetScrollableCreator();

  return (
    <BottomSheetModal
      ref={ref}
      stackBehavior="push"
      detached={width > MAX_WIDTH}
      snapPoints={[
        Math.min(
          ModalSize[props.size],
          props.estimatedHeight +
            styles.inset.height +
            (width > MAX_WIDTH
              ? styles.inset.height
              : Math.max(insets.bottom, styles.inset.height)),
          height - insets.top - (width > MAX_WIDTH ? Math.max(insets.bottom, 20) : 0),
        ),
      ]}
      enablePanDownToClose={props.allowDismiss}
      bottomInset={width > MAX_WIDTH ? Math.max(insets.bottom, 20) : 0}
      containerStyle={width > MAX_WIDTH && { marginHorizontal: (width - MAX_WIDTH) / 2 }}
      backgroundStyle={[
        theme.backgroundStyle,
        width > MAX_WIDTH ? styles.detachedPanel : styles.panel,
        props.style,
      ]}
      onDismiss={handleDismiss}
      handleComponent={null}
      backdropComponent={props.allowDismiss ? CloseBackdrop : IgnoreBackdrop}
      enableDynamicSizing={false}
    >
      <FlashList
        showsHorizontalScrollIndicator={false}
        data={props.data}
        keyExtractor={props.keyExtractor}
        renderItem={props.renderItem}
        renderScrollComponent={renderScrollComponent}
        estimatedItemSize={props.estimatedItemSize}
        extraData={props.extraData}
        ListHeaderComponent={
          <VStack>
            <View style={styles.inset} />
            {props.ListHeaderComponent}
          </VStack>
        }
        ListFooterComponent={
          <View
            style={{
              height:
                width > MAX_WIDTH
                  ? styles.inset.height
                  : Math.max(insets.bottom, styles.inset.height),
            }}
          />
        }
        contentContainerStyle={props.noPadding ? undefined : styles.padding}
      />
    </BottomSheetModal>
  );
};

interface FullscreenModalProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

const FullscreenModal = (props: FullscreenModalProps) => {
  const theme = useTheme();

  const { height } = useWindowDimensions();

  const { ref, handleDismiss } = useControlledBottomSheetModal(props.isVisible, props.onDismiss);

  return (
    <BottomSheetModal
      ref={ref}
      stackBehavior="push"
      detached={false}
      enableOverDrag={false}
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      snapPoints={[height]}
      backgroundStyle={[theme.backgroundStyle, props.style]}
      onDismiss={handleDismiss}
      handleComponent={null}
      backdropComponent={IgnoreBackdrop}
    >
      <BottomSheetView style={[ViewStyles.f, { height }]}>{props.children}</BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  panel: {
    ...ViewStyles.rt2,
  },
  detachedPanel: {
    ...ViewStyles.r2,
  },
  padding: {
    ...ViewStyles.px4,
  },
  inset: {
    height: ViewStyles.px4.paddingHorizontal,
  },
});

export { Modal, FlashModal, FullscreenModal };
