import { Avatar, HStack, ScrollView, Skeleton } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import { TransformPressable } from "../components";
import { Color, Friend, Friends } from "../models";

interface FriendViewProps {
  accentColor: ColorType;
  friends?: Friends;
}

const FriendView = (props: FriendViewProps) => {
  const getBorderColor = (friend: Friend) => {
    switch (friend.onlineState) {
      case "VS_MODE_FIGHTING":
      case "VS_MODE_MATCHING":
        switch (friend.vsMode!.id) {
          case "VnNNb2RlLTE=":
            return Color.RegularBattle;
          case "VnNNb2RlLTI=":
            return Color.AnarchyBattle;
          case "VnNNb2RlLTM=":
            return Color.XBattle;
          case "VnNNb2RlLTU=":
            return Color.PrivateBattle;
          case "VnNNb2RlLTY=":
          case "VnNNb2RlLTc=":
          case "VnNNb2RlLTg=":
            return props.accentColor;
        }
        return "teal.300";
      case "COOP_MODE_FIGHTING":
      case "COOP_MODE_MATCHING":
        switch (friend.coopRule!) {
          case "REGULAR":
            return Color.SalmonRun;
          // TODO: have not been checked.
          case "BIG_RUN":
            return Color.BigRun;
        }
        return "teal.300";
      case "ONLINE":
        return "teal.300";
      default:
        return undefined;
    }
  };
  const getBorderWidth = (friend: Friend) => {
    switch (friend.onlineState) {
      case "VS_MODE_FIGHTING":
      case "COOP_MODE_FIGHTING":
        return 3;
      case "VS_MODE_MATCHING":
      case "COOP_MODE_MATCHING":
      case "ONLINE":
        return 2;
      default:
        return 0;
    }
  };

  return (
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator={false}>
      <HStack space={2} px={4}>
        {(() => {
          if (props.friends) {
            return props.friends.friends.nodes.map((friend) => (
              <TransformPressable key={friend.id}>
                <Avatar
                  size="md"
                  bg="gray.100"
                  _dark={{ bg: "gray.700" }}
                  source={{
                    uri: friend.userIcon.url,
                  }}
                  borderColor={getBorderColor(friend)}
                  borderWidth={getBorderWidth(friend)}
                />
              </TransformPressable>
            ));
          } else {
            return new Array(100).fill(0).map((_, i) => (
              <TransformPressable key={i}>
                <Skeleton w={12} h={12} rounded="full" />
              </TransformPressable>
            ));
          }
        })()}
      </HStack>
    </ScrollView>
  );
};

export default FriendView;
