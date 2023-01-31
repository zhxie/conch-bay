import { FlashList } from "@shopify/flash-list";
import { Dimensions, StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Avatar, Circle, VStack, ViewStyles } from "../components";
import { Friend, Friends } from "../models/types";
import { getFriendColor, getUserIconCacheSource } from "../utils/ui";

interface FriendViewProps {
  friends?: Friends;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const placeholder = Math.ceil((Dimensions.get("window").width + 8) / 64);

  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;

  const renderItem = (friend: { item: Friend | number; index: number }) => {
    if (typeof friend.item === "number") {
      return (
        <Circle
          size={48}
          style={[
            friend.index !== placeholder - 1 ? ViewStyles.mr2 : undefined,
            style,
            ViewStyles.disabled,
          ]}
        />
      );
    }
    return (
      <Avatar
        size={48}
        image={getUserIconCacheSource(friend.item.userIcon.url)}
        badge={getFriendColor(friend.item)}
        style={
          friend.index !== props.friends!.friends.nodes.length - 1 ? ViewStyles.mr2 : undefined
        }
      />
    );
  };

  return (
    <VStack style={[ViewStyles.wf, props.style]}>
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={props.friends?.friends.nodes ?? new Array(placeholder).fill(0)}
        keyExtractor={(friend, i) => {
          if (typeof friend === "number") {
            return String(i);
          }
          return friend.id;
        }}
        renderItem={renderItem}
        estimatedItemSize={48}
        getItemType={(item) => {
          return typeof item;
        }}
        contentContainerStyle={ViewStyles.px4}
      />
    </VStack>
  );
};

export default FriendView;
