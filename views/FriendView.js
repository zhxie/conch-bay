import { Avatar, HStack, ScrollView, Skeleton } from "native-base";
import { TransformPressable } from "../components";

const FriendView = (props) => {
  const { accentColor, friends } = props;

  const getBorderColor = (onlineState, vsMode) => {
    switch (onlineState) {
      case "VS_MODE_FIGHTING":
      case "VS_MODE_MATCHING":
        if (vsMode) {
          switch (vsMode) {
            case "VnNNb2RlLTE=":
              return "green.500";
            case "VnNNb2RlLTI=":
              return "orange.600";
            case "VnNNb2RlLTM=":
              return "emerald.400";
            case "VnNNb2RlLTY=":
              return accentColor;
          }
        }
        return "orange.600";
      case "COOP_MODE_FIGHTING":
      case "COOP_MODE_MATCHING":
        return "orange.500";
      case "ONLINE":
        return "teal.300";
      default:
        return undefined;
    }
  };
  const getBorderWidth = (onlineState) => {
    switch (onlineState) {
      case "VS_MODE_FIGHTING":
      case "VS_MODE_MATCHING":
        return 3;
      case "COOP_MODE_FIGHTING":
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
                  borderColor={getBorderColor(friend["onlineState"], friend["vsMode"])}
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
