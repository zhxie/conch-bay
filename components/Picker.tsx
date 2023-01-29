import { useState } from "react";
import { StyleProp, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import Button from "./Button";
import Modal from "./Modal";
import { VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";
import Text from "./Text";

interface PickerItemProps {
  key: string;
  value: string;
}
interface PickerProps {
  isDisabled?: boolean;
  title: string;
  items: PickerItemProps[];
  onSelected: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

const Picker = (props: PickerProps) => {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === "light" ? Color.LightBackground : Color.DarkBackground;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [open, setOpen] = useState(false);

  const onPress = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <Button isDisabled={props.isDisabled} style={ViewStyles.accent} onPress={onPress}>
      <Text numberOfLines={1} style={reverseTextColor}>
        {props.title}
      </Text>
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
              <Text numberOfLines={1} style={reverseTextColor}>
                {item.value}
              </Text>
            </Button>
          ))}
        </VStack>
      </Modal>
    </Button>
  );
};

export default Picker;
