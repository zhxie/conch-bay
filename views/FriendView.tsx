import { ScrollView, StyleProp, useColorScheme, ViewStyle } from "react-native";
import { Avatar, Color, HStack, ViewStyles } from "../components";
import { Friend, Friends, SplatfestFriendsTeams } from "../models/types";
import { getFriendColor, getSplatfestFriendsTeamColor, getUserIconCacheKey } from "../utils/ui";

interface FriendViewProps {
  friends?: Friends;
  splatfestFriendsTeams?: SplatfestFriendsTeams;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;

  const formatTeamColor = (friend: Friend) => {
    if (!props.splatfestFriendsTeams) {
      return "transparent";
    }

    const team = props.splatfestFriendsTeams.fest.teams.find((team) => {
      const node = team.votes.nodes.find((node) => node.userIcon.url === friend.userIcon.url);
      if (node) {
        return true;
      }
      return false;
    });
    if (team) {
      return getSplatfestFriendsTeamColor(team);
    }
    return "transparent";
  };

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
                badge={getFriendColor(friend, accentColor)}
                style={i !== friends.length - 1 ? ViewStyles.mr2 : undefined}
                imageStyle={{
                  borderColor: formatTeamColor(friend),
                  borderWidth: 2,
                }}
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
