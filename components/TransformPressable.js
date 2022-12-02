import { Box, Pressable } from "native-base";

const TransformPressable = (props) => {
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
