import { Box, Pressable } from "native-base";

interface TransformPressableProps {
  onPress: () => void;
  children?: JSX.Element;
}

const TransformPressable = (props: TransformPressableProps) => {
  const { onPress, children } = props;

  return (
    <Pressable onPress={onPress}>
      {({ isPressed }) => {
        return (
          <Box
            style={{
              transform: [
                {
                  scale: isPressed ? 0.96 : 1,
                },
              ],
            }}
          >
            {children}
          </Box>
        );
      }}
    </Pressable>
  );
};

export default TransformPressable;
