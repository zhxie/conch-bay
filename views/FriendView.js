import { Avatar, HStack, ScrollView, Skeleton } from "native-base";
import { Color } from "../models";
import { TransformPressable } from "../components";

const FriendView = (props) => {
  const { accentColor, friends } = props;

  const getBorderColor = (onlineState, vsMode, coopRule) => {
    switch (onlineState) {
      case "VS_MODE_FIGHTING":
      case "VS_MODE_MATCHING":
        switch (vsMode["id"]) {
          case "VnNNb2RlLTE=":
            return Color.RegularBattle;
          case "VnNNb2RlLTI=":
            return Color.AnarchyBattle;
          case "VnNNb2RlLTM=":
            return Color.XBattle;
          case "VnNNb2RlLTU=":
            return Color.PrivateBattle;
          case "VnNNb2RlLTY=":
            return accentColor;
        }
        return "teal.300";
      case "COOP_MODE_FIGHTING":
      case "COOP_MODE_MATCHING":
        switch (coopRule) {
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
  const getBorderWidth = (onlineState) => {
    switch (onlineState) {
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
    <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator="false">
      <HStack space={2} px={4}>
        {(() => {
          if (friends) {
            return friends["data"]["friends"]["nodes"].map((friend) => (
              <TransformPressable key={friend["id"]}>
                <Avatar
                  size="md"
                  _dark={{ bg: "gray.700" }}
                  _light={{ bg: "gray.100" }}
                  source={{
                    uri: friend["userIcon"]["url"],
                  }}
                  borderColor={getBorderColor(
                    friend["onlineState"],
                    friend["vsMode"],
                    friend["coopRule"]
                  )}
                  borderWidth={getBorderWidth(friend["onlineState"])}
                />
              </TransformPressable>
            ));
          } else {
            return new Array(100).fill(0).map((_, i) => (
              <TransformPressable key={i}>
                <Skeleton size="12" rounded="full" />
              </TransformPressable>
            ));
          }
        })()}
      </HStack>
    </ScrollView>
  );
};

export default FriendView;
