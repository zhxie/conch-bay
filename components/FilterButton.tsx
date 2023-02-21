import { StyleProp, ViewStyle } from "react-native";
import Pressable from "./Pressable";
import { Circle } from "./Shape";
import { HStack } from "./Stack";
import { Color, ViewStyles } from "./Styles";
import Text from "./Text";

interface FilterButtonProps {
  isDisabled?: boolean;
  color?: string;
  textColor?: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const FilterButton = (props: FilterButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      style={[
        ViewStyles.p2,
        { height: 32, borderRadius: 16 },
        !!props.color && !!props.textColor && { backgroundColor: props.color },
        props.style,
      ]}
      onPress={props.onPress}
    >
      <HStack flex center>
        {!props.textColor && (
          <Circle
            size={12}
            color={Color.MiddleTerritory}
            style={[ViewStyles.mr1, !!props.color && { backgroundColor: props.color }]}
          />
        )}
        <Text numberOfLines={1} style={!!props.color && { color: props.textColor }}>
          {props.title}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default FilterButton;
