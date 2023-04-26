import { useState } from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle, useColorScheme } from "react-native";
import Button from "./Button";
import Marquee from "./Marquee";
import { Modal } from "./Modal";
import { VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

interface PickerItemProps {
  key: string;
  value: string;
}
interface PickerProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  isLoadingText?: string;
  title: string;
  items: PickerItemProps[];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onSelected: (key: string) => void;
  onPress?: () => void;
}

const Picker = (props: PickerProps) => {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === "light" ? Color.LightBackground : Color.DarkBackground;
  const reverseTextStyle = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [open, setOpen] = useState(false);

  const onPress = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <Button
      isDisabled={props.isDisabled}
      isLoading={props.isLoading}
      isLoadingText={props.isLoadingText}
      style={[ViewStyles.accent, props.style]}
      textStyle={props.textStyle}
      onPress={props.onPress ?? onPress}
      onLongPress={props.onPress ? onPress : undefined}
    >
      <Marquee style={[reverseTextStyle, props.textStyle]}>{props.title}</Marquee>
      <Modal isVisible={open} onClose={onClose} style={ViewStyles.modal0_5d}>
        <VStack flex style={ViewStyles.wf}>
          {props.items.map((item, i, items) => (
            <Button
              key={item.key}
              isDisabled={props.isDisabled}
              style={[
                ViewStyles.accent,
                i !== 0 && ViewStyles.rt0,
                i !== items.length - 1 && ViewStyles.rb0,
                i !== 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth * 2,
                  borderTopColor: borderColor,
                },
                i !== items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth * 2,
                  borderBottomColor: borderColor,
                },
              ]}
              onPress={() => {
                props.onSelected(item.key);
                onClose();
              }}
            >
              <Marquee style={reverseTextStyle}>{item.value}</Marquee>
            </Button>
          ))}
        </VStack>
      </Modal>
    </Button>
  );
};

export default Picker;
