import { useState } from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
import Button from "./Button";
import Marquee from "./Marquee";
import { Modal } from "./Modal";
import { VStack } from "./Stack";
import { ViewStyles, useTheme } from "./Styles";

interface PickerItemProps {
  key: string;
  value: string;
}
interface PickerProps {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  title: string;
  items: PickerItemProps[];
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onSelected: (key: string) => void;
  onPress?: () => void;
}

const Picker = (props: PickerProps) => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const onPress = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <Button
      disabled={props.disabled}
      loading={props.loading}
      loadingText={props.loadingText}
      style={[ViewStyles.accent, props.style]}
      textStyle={props.textStyle}
      onPress={props.onPress ?? onPress}
      onLongPress={props.onPress ? onPress : undefined}
    >
      <Marquee style={[theme.reverseTextStyle, props.textStyle]}>{props.title}</Marquee>
      <Modal isVisible={open} onClose={onClose} style={ViewStyles.modal0_67d}>
        <VStack flex style={ViewStyles.wf}>
          {props.header}
          {props.items.map((item, i, items) => (
            <Button
              key={item.key}
              disabled={props.disabled}
              style={[
                ViewStyles.accent,
                i !== 0 && ViewStyles.rt0,
                i !== items.length - 1 && ViewStyles.rb0,
                i !== 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth * 2,
                  borderTopColor: theme.backgroundColor,
                },
                i !== items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth * 2,
                  borderBottomColor: theme.backgroundColor,
                },
              ]}
              onPress={() => {
                onClose();
                props.onSelected(item.key);
              }}
            >
              <Marquee style={theme.reverseTextStyle}>{item.value}</Marquee>
            </Button>
          ))}
        </VStack>
      </Modal>
    </Button>
  );
};

export default Picker;
