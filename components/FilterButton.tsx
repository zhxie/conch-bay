import { StyleProp, ViewStyle } from "react-native";
import { HStack } from "./Stack";
import { ViewStyles } from "./Styles";
import Pressable from "./Pressable";
import Text from "./Text";
import { Circle } from "./Shape";

interface FilterButtonProps {
  isDisabled?: boolean;
  color?: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const FilterButton = (props: FilterButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      style={[ViewStyles.p2, { height: 32, borderRadius: 16 }, props.style]}
      onPress={props.onPress}
    >
      <HStack flex center>
        <Circle
          size={12}
          color="#a1a1aa"
          style={[ViewStyles.mr1, props.color !== undefined && { backgroundColor: props.color }]}
        />
        <Text numberOfLines={1}>{props.title}</Text>
      </HStack>
    </Pressable>
  );
};

export default FilterButton;
