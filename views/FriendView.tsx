import { ScrollView, StyleProp, ViewStyle } from "react-native";
import { Avatar, HStack, ViewStyles } from "../components";
import { Friends } from "../models/types";
import { getFriendColor, getUserIconCacheKey } from "../utils/ui";

interface FriendViewProps {
  friends?: Friends;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[ViewStyles.wf, props.style]}
    >
      <HStack center style={ViewStyles.px4}>
        {(() => {
          if (props.friends) {
            return props.friends.friends.nodes.map((friend, i, friends) => (
              <Avatar
                key={friend.id}
                size={48}
                uri={friend.userIcon.url}
                cacheKey={getUserIconCacheKey(friend.userIcon.url)}
                badge={getFriendColor(friend)}
                style={i !== friends.length - 1 ? ViewStyles.mr2 : undefined}
              />
            ));
          } else {
            return new Array(8)
              .fill(0)
              .map((_, i) => (
                <Avatar key={i} size={48} isDisabled style={i !== 7 ? ViewStyles.mr2 : undefined} />
              ));
          }
        })()}
      </HStack>
    </ScrollView>
  );
};

export default FriendView;
