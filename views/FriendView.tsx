import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Dimensions, StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Avatar, Color, VStack, ViewStyles } from "../components";
import { Friend, FriendListResult } from "../models/types";
import { getFriendColor, getFriendOutline, getUserIconCacheSource } from "../utils/ui";

interface FriendViewProps {
  friends?: FriendListResult;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const placeholder = Math.ceil((Dimensions.get("window").width + 8) / 64);

  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;
  const color = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;

  const renderItem = (friend: ListRenderItemInfo<Friend | number>) => {
    if (typeof friend.item === "number") {
      return (
        <Avatar
          size={48}
          recyclingKey={String(friend.item)}
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
        recyclingKey={friend.item.id}
        badge={{
          color: getFriendColor(friend.item) ?? friend.extraData,
          outline: getFriendOutline(friend.item),
        }}
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
        extraData={color}
        estimatedItemSize={48}
        contentContainerStyle={ViewStyles.px4}
      />
    </VStack>
  );
};

export default FriendView;
