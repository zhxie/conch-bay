import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

const Backdrop = (props: any) => {
  return (
    <BottomSheetBackdrop
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      {...props}
    />
  );
};

const ModalSize = {
  small: 384,
  medium: 576,
  large: 672,
};

interface ModalProps {
  isVisible: boolean;
  size: "small" | "medium" | "large";
  noPadding?: boolean;
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

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
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={[theme.backgroundStyle, styles.panel, props.style]}
      handleComponent={null}
      backdropComponent={Backdrop}
      maxDynamicContentSize={ModalSize[props.size]}
      onDismiss={props.onDismiss}
    >
      <BottomSheetScrollView style={[styles.panel, !props.noPadding && styles.padding]}>
        <View onLayout={props.onLayout} style={[styles.inset, ViewStyles.rt2]} />
        {props.children}
        <View
          style={{
            height: Math.max(insets.bottom, styles.inset.height),
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
      snapPoints={[
        Math.min(
          ModalSize[props.size],
          props.estimatedHeight + styles.inset.height + Math.max(insets.bottom, styles.inset.height)
        ),
      ]}
      enablePanDownToClose
      backgroundStyle={[theme.backgroundStyle, styles.panel, props.style]}
      handleComponent={null}
      backdropComponent={Backdrop}
      onDismiss={props.onDismiss}
    >
      <FlashList
        showsHorizontalScrollIndicator={false}
        data={props.data}
        keyExtractor={props.keyExtractor}
        renderItem={props.renderItem}
        estimatedItemSize={props.estimatedItemSize}
        // HACK: forcly cast.
        renderScrollComponent={BottomSheetScrollView as React.ComponentType<ScrollViewProps>}
        ListHeaderComponent={
          <VStack>
            <View style={styles.inset} />
            {props.ListHeaderComponent}
          </VStack>
        }
        ListFooterComponent={
          <View
            style={{
              height: Math.max(insets.bottom, styles.inset.height),
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
      enableOverDrag={false}
      enablePanDownToClose={false}
      snapPoints={["100%"]}
      backgroundStyle={props.style}
      handleComponent={null}
      backdropComponent={Backdrop}
      onDismiss={props.onDismiss}
    >
      <BottomSheetView style={[ViewStyles.f]}>{props.children}</BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  panel: {
    ...ViewStyles.rt2,
  },
  padding: {
    ...ViewStyles.px4,
  },
  inset: {
    height: ViewStyles.px4.paddingHorizontal,
  },
});

export { Modal, FlashModal, FullscreenModal };
