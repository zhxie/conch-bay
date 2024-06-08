import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { StyleProp, ViewStyle, useWindowDimensions } from "react-native";
import {
  Avatar,
  AvatarButton,
  Badge,
  Color,
  HStack,
  Marquee,
  Modal,
  Text,
  TextStyles,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import {
  DetailVotingStatusResult,
  Friend,
  FriendListResult,
  FriendOnlineState,
} from "../models/types";
import { Presence } from "../utils/api";
import { decode64Suffix } from "../utils/codec";
import {
  dodgeColor,
  getCoopRuleColor,
  getSolidColor,
  getUserIconCacheSource,
  getVsModeColor,
} from "../utils/ui";

interface FriendViewProps {
  friends?: FriendListResult;
  presences?: Presence[];
  voting?: DetailVotingStatusResult;
  style?: StyleProp<ViewStyle>;
}

const FriendView = (props: FriendViewProps) => {
  const { width } = useWindowDimensions();
  const placeholder = Math.ceil((width - 32) / 56);

  const theme = useTheme();

  const [friend, setFriend] = useState<Friend>();
  const [nsoFriend, setNsoFriend] = useState<Presence>();
  const [displayFriend, setDisplayFriend] = useState(false);

  const presences = useMemo(() => {
    const map = new Map<string, Presence>();
    for (const friend of props.presences ?? []) {
      map.set(friend.nsaId, friend);
    }
    return map;
  }, [props.presences]);
  const voting = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        color: string;
      }
    >();
    for (const team of props.voting?.fest?.teams ?? []) {
      for (const friend of team.votes?.nodes ?? []) {
        map.set(friend.userIcon.url, { name: team.teamName, color: getSolidColor(team.color) });
      }
      for (const friend of team.preVotes?.nodes ?? []) {
        map.set(friend.userIcon.url, {
          name: team.teamName,
          color: dodgeColor(getSolidColor(team.color)),
        });
      }
    }
    return map;
  }, [props.voting]);

  const isInSplatoon3 = (nsoFriend?: Presence) => {
    if (nsoFriend === undefined) {
      return undefined;
    }
    return nsoFriend.presence.game.shopUri?.includes("0100c2500fc20000");
  };
  const getFriendColor = (friend: Friend) => {
    switch (friend.onlineState) {
      case FriendOnlineState.VS_MODE_FIGHTING:
        return getVsModeColor(friend.vsMode!.id);
      case FriendOnlineState.COOP_MODE_FIGHTING:
        return getCoopRuleColor(friend.coopRule!);
      case FriendOnlineState.MINI_GAME_PLAYING:
        return Color.TableturfBattle;
      case FriendOnlineState.VS_MODE_MATCHING:
      case FriendOnlineState.COOP_MODE_MATCHING:
      case FriendOnlineState.ONLINE:
        return undefined;
      case FriendOnlineState.OFFLINE:
        return "transparent";
    }
  };
  const getFriendOutline = (friend: Friend, nsoFriend?: Presence) => {
    switch (friend.onlineState) {
      case FriendOnlineState.VS_MODE_MATCHING:
        return getVsModeColor(friend.vsMode!.id);
      case FriendOnlineState.COOP_MODE_MATCHING:
        return getCoopRuleColor(friend.coopRule!);
      case FriendOnlineState.ONLINE:
        if (!isInSplatoon3(nsoFriend)) {
          return Color.MiddleTerritory;
        }
        return Color.Online;
      case FriendOnlineState.VS_MODE_FIGHTING:
      case FriendOnlineState.COOP_MODE_FIGHTING:
      case FriendOnlineState.MINI_GAME_PLAYING:
      case FriendOnlineState.OFFLINE:
        return "transparent";
    }
  };
  const getFriendOnlineStatusColor = (friend: Friend) => {
    switch (friend.onlineState) {
      case FriendOnlineState.VS_MODE_FIGHTING:
        return getVsModeColor(friend.vsMode!.id);
      case FriendOnlineState.COOP_MODE_FIGHTING:
        return getCoopRuleColor(friend.coopRule!);
      case FriendOnlineState.MINI_GAME_PLAYING:
        return Color.TableturfBattle;
      case FriendOnlineState.VS_MODE_MATCHING:
      case FriendOnlineState.COOP_MODE_MATCHING:
      case FriendOnlineState.ONLINE:
        return Color.Online;
      case FriendOnlineState.OFFLINE:
        return Color.MiddleTerritory;
    }
  };
  const formatFriendOnlineStatus = (friend: Friend) => {
    switch (friend.onlineState) {
      case FriendOnlineState.VS_MODE_FIGHTING:
        return "playing";
      case FriendOnlineState.COOP_MODE_FIGHTING:
        return "working";
      case FriendOnlineState.VS_MODE_MATCHING:
      case FriendOnlineState.COOP_MODE_MATCHING:
      case FriendOnlineState.MINI_GAME_PLAYING:
      case FriendOnlineState.ONLINE:
        return "online";
      case FriendOnlineState.OFFLINE:
        return "offline";
    }
  };
  const formatOfflineTime = (nsoFriend?: Presence) => {
    if (!nsoFriend || nsoFriend.presence.logoutAt === 0) {
      return undefined;
    }
    const logoutAt = dayjs(nsoFriend.presence.logoutAt * 1000);
    const now = dayjs();
    const year = now.diff(logoutAt, "year");
    if (year > 0) {
      return t("n_year_ago", { n: year });
    }
    const month = now.diff(logoutAt, "month");
    if (month > 0) {
      return t("n_month_ago", { n: month });
    }
    const day = now.diff(logoutAt, "day");
    if (day > 0) {
      return t("n_day_ago", { n: day });
    }
    const hour = now.diff(logoutAt, "hour");
    if (hour > 0) {
      return t("n_hour_ago", { n: hour });
    }
    const minute = now.diff(logoutAt, "minute");
    return t("n_minute_ago", { n: minute });
  };

  const onFriendDismiss = () => {
    setDisplayFriend(false);
  };

  const renderItem = (friend: ListRenderItemInfo<Friend>) => {
    const id = decode64Suffix(friend.item.id);
    return (
      <AvatarButton
        size={48}
        image={getUserIconCacheSource(friend.item.userIcon.url)}
        badge={{
          color: getFriendColor(friend.item) ?? friend.extraData,
          outline: getFriendOutline(friend.item, presences.get(id)),
        }}
        style={
          friend.index !== props.friends!.friends.nodes.length - 1 ? ViewStyles.mr2 : undefined
        }
        onPress={() => {
          setFriend(friend.item);
          setNsoFriend(presences.get(id));
          setDisplayFriend(true);
        }}
      />
    );
  };

  return (
    <VStack style={[ViewStyles.wf, props.style]}>
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={props.friends?.friends.nodes ?? undefined}
        keyExtractor={(friend) => {
          return friend.id;
        }}
        renderItem={renderItem}
        extraData={theme.territoryColor}
        estimatedItemSize={48}
        ListEmptyComponent={
          <HStack flex>
            {new Array(placeholder).fill(0).map((_, i) => (
              <Avatar
                key={i}
                size={48}
                style={[
                  i !== placeholder - 1 ? ViewStyles.mr2 : undefined,
                  theme.territoryStyle,
                  ViewStyles.disabled,
                ]}
              />
            ))}
          </HStack>
        }
        contentContainerStyle={ViewStyles.px4}
      />
      <Modal isVisible={displayFriend} size="medium" onDismiss={onFriendDismiss}>
        {friend && (
          <VStack center>
            <Avatar
              size={64}
              image={getUserIconCacheSource(friend.userIcon.url)}
              style={ViewStyles.mb2}
            />
            <Marquee style={[ViewStyles.mb2, TextStyles.h2]}>
              {friend.playerName ?? friend.nickname}
              <Text style={TextStyles.subtle}>
                {friend.playerName !== null && friend.nickname !== friend.playerName
                  ? ` (${friend.nickname})`
                  : ""}
              </Text>
            </Marquee>
            {/* HACK: withdraw 4px margin in the last badge. */}
            <HStack center style={{ marginRight: -ViewStyles.mr1.marginRight }}>
              <Badge
                color={getFriendOnlineStatusColor(friend)!}
                title={t(formatFriendOnlineStatus(friend)!)}
                style={ViewStyles.mr1}
              />
              {friend.vsMode && (
                <Badge
                  color={getVsModeColor(friend.vsMode.id)!}
                  title={t(friend.vsMode.id)}
                  style={ViewStyles.mr1}
                />
              )}
              {friend.coopRule && (
                <Badge
                  color={getCoopRuleColor(friend.coopRule)!}
                  title={t(friend.coopRule)}
                  style={ViewStyles.mr1}
                />
              )}
              {friend.onlineState === FriendOnlineState.MINI_GAME_PLAYING && (
                <Badge
                  color={Color.TableturfBattle}
                  title={t("tableturf_battle")}
                  style={ViewStyles.mr1}
                />
              )}
              {friend.onlineState === FriendOnlineState.ONLINE && !isInSplatoon3(nsoFriend) && (
                <Badge
                  color={getFriendOnlineStatusColor(friend)!}
                  title={nsoFriend!.presence.game.name!}
                  style={ViewStyles.mr1}
                />
              )}
              {friend.onlineState === FriendOnlineState.OFFLINE &&
                !formatOfflineTime(nsoFriend) && (
                  <Badge
                    color={getFriendOnlineStatusColor(friend)!}
                    title={formatOfflineTime(nsoFriend)!}
                    style={ViewStyles.mr1}
                  />
                )}
              {voting.has(friend.userIcon.url) && (
                <Badge
                  color={voting.get(friend.userIcon.url)!.color}
                  title={voting.get(friend.userIcon.url)!.name}
                  style={ViewStyles.mr1}
                />
              )}
            </HStack>
          </VStack>
        )}
      </Modal>
    </VStack>
  );
};

export default FriendView;
