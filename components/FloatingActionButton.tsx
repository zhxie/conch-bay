import Lucide from "./Lucide";
import Pressable from "./Pressable";
import { Center } from "./Stack";
import { Color, ViewStyles } from "./Styles";

interface FloatingActionButtonProps {
  isDisabled?: boolean;
  size: number;
  color?: string;
  icon: string;
  onPress?: () => void;
}

const FloatingActionButton = (props: FloatingActionButtonProps) => {
  return (
    <Pressable
      isDisabled={props.isDisabled}
      style={[
        ViewStyles.s2,
        {
          width: props.size,
          height: props.size,
          position: "absolute",
          right: 20,
          bottom: 20,
          borderRadius: props.size / 2,
        },
        !!props.color && { backgroundColor: props.color },
      ]}
      onPress={props.onPress}
    >
      <Center flex>
        <Lucide
          name={props.icon as any}
          size={props.size * 0.5}
          color={props.color ? "white" : Color.MiddleTerritory}
        />
      </Center>
    </Pressable>
  );
};

export default FloatingActionButton;
