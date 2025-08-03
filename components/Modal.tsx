import {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ListRenderItem } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
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

const CloseBackdrop = (props: any) => {
  return (
    <BottomSheetBackdrop
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      {...props}
    />
  );
};

const IgnoreBackdrop = (props: any) => {
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

  useEffect(() => {
    if (props.isVisible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [props.isVisible]);

  const ref = useRef<BottomSheetModal>(null);

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
      onDismiss={props.onDismiss}
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
  ListHeaderComponent?: React.ReactNode;
}

const FlashModal = <T,>(props: FlashModalProps<T>) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (props.isVisible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [props.isVisible]);

  const ref = useRef<BottomSheetModal>(null);

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
      onDismiss={props.onDismiss}
      handleComponent={null}
      backdropComponent={props.allowDismiss ? CloseBackdrop : IgnoreBackdrop}
      enableDynamicSizing={false}
    >
      <BottomSheetFlashList
        showsHorizontalScrollIndicator={false}
        data={props.data}
        keyExtractor={props.keyExtractor}
        renderItem={props.renderItem}
        estimatedItemSize={props.estimatedItemSize}
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
        // HACK: forcly cast.
        contentContainerStyle={!props.noPadding && (styles.padding as any)}
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

  useEffect(() => {
    if (props.isVisible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [props.isVisible]);

  const ref = useRef<BottomSheetModal>(null);

  return (
    <BottomSheetModal
      ref={ref}
      stackBehavior="push"
      detached={false}
      enableOverDrag={false}
      enablePanDownToClose={false}
      snapPoints={["100%"]}
      backgroundStyle={[theme.backgroundStyle, props.style]}
      onDismiss={props.onDismiss}
      handleComponent={null}
      backdropComponent={IgnoreBackdrop}
    >
      <BottomSheetView style={[ViewStyles.f]}>{props.children}</BottomSheetView>
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
