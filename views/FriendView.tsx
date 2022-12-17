import { ScrollView, StyleProp, useColorScheme, ViewStyle } from "react-native";
import { Avatar, HStack, ViewStyles } from "../components";
import { Color, Friends } from "../models";
import { getFriendColor } from "../utils/ui";

interface FriendViewProps {
  friends?: Friends;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ width: "100%" }, props.style]}
    >
      <HStack center style={ViewStyles.px4}>
        {(() => {
          if (props.friends) {
            return props.friends.friends.nodes.map((friend, i) => (
              <Avatar
                key={i}
                size={48}
                source={{
                  uri: friend.userIcon.url,
                }}
                style={i !== props.friends!.friends.nodes.length - 1 ? ViewStyles.mr2 : undefined}
                imageStyle={{
                  borderColor: getFriendColor(friend, accentColor),
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
