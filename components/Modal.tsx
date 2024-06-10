import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Component, ForwardedRef, forwardRef, RefObject, useImperativeHandle, useRef } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

interface ModalHandle {
  present: () => void;
  dismiss: () => void;
}

interface ModalBaseProps {
  scrollRef?: RefObject<Component<unknown>>;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
  onPresent?: () => void;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

const ModalBase = forwardRef((props: ModalBaseProps, ref: ForwardedRef<ModalHandle>) => {
  const modal = useRef<TrueSheet>(null);

  useImperativeHandle(ref, () => {
    return {
      present: async () => {
        await modal.current?.present();
      },
      dismiss: async () => {
        await modal.current?.dismiss();
      },
    };
  });

  return (
    <TrueSheet
      ref={modal}
      scrollRef={props.scrollRef}
      dismissible={props.dismissible}
      sizes={["auto"]}
      cornerRadius={24}
      style={props.style}
      onPresent={props.onPresent}
      onDismiss={props.onDismiss}
    >
      {props.children}
    </TrueSheet>
  );
});

interface ModalProps {
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
  onPresent?: () => void;
  onDismiss?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
}

const Modal = forwardRef((props: ModalProps, ref: ForwardedRef<ModalHandle>) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const modal = useRef<ModalHandle>(null);

  useImperativeHandle(ref, () => {
    return {
      present: () => {
        modal.current?.present();
      },
      dismiss: () => {
        modal.current?.dismiss();
      },
    };
  });

  return (
    <ModalBase
      ref={modal}
      dismissible={props.dismissible}
      onPresent={props.onPresent}
      onDismiss={props.onDismiss}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        onLayout={props.onLayout}
        style={[styles.panel, theme.backgroundStyle, props.style]}
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
});

interface FlashModalProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  estimatedItemSize: number;
  ListHeaderComponent?: React.ReactNode;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
  onPresent?: () => void;
  onDismiss?: () => void;
}

const FlashModal = forwardRef(<T,>(props: FlashModalProps<T>, ref: ForwardedRef<ModalHandle>) => {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const modal = useRef<ModalHandle>(null);
  const scrollView = useRef<any>(null);

  useImperativeHandle(ref, () => {
    return {
      present: () => {
        modal.current?.present();
      },
      dismiss: () => {
        modal.current?.dismiss();
      },
    };
  });

  return (
    <ModalBase
      ref={modal}
      scrollRef={scrollView}
      dismissible={props.dismissible}
      onPresent={props.onPresent}
      onDismiss={props.onDismiss}
    >
      <VStack style={[styles.panel, theme.backgroundStyle, props.style]}>
        <FlashList
          ref={scrollView}
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
        />
      </VStack>
    </ModalBase>
  );
});

const styles = StyleSheet.create({
  panel: {
    ...ViewStyles.rt2,
    ...ViewStyles.px4,
  },
  padding: {
    height: 16,
  },
});

export { ModalHandle, ModalBase, Modal, FlashModal };
