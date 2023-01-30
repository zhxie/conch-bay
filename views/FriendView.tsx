import { FlashList } from "@shopify/flash-list";
import { Dimensions, StyleProp, ViewStyle } from "react-native";
import { Avatar, Center, VStack, ViewStyles } from "../components";
import { Friend, Friends } from "../models/types";
import { getFriendColor, getUserIconCacheSource } from "../utils/ui";

interface FriendViewProps {
  friends?: Friends;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const placeholder = Math.ceil(Dimensions.get("window").width / 56);

  const renderItem = (friend: { item: Friend | number; index: number }) => {
    if (typeof friend.item === "number") {
      return (
        // HACK: avoid weird opacity animation.
        <Center>
          <Avatar
            size={48}
            isDisabled
            style={friend.index !== placeholder - 1 ? ViewStyles.mr2 : undefined}
          />
        </Center>
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
