import { useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  Badge,
  BadgeButton,
  Center,
  Color,
  MasonryFlashModal,
  RewardBox,
  VStack,
  ViewStyles,
} from "../components";
import { CatalogResult, CatalogReward } from "../models/types";
import { getImageCacheSource } from "../utils/ui";

interface CatalogViewProps {
  catalogLevel: string;
  catalog?: CatalogResult;
  style?: StyleProp<ViewStyle>;
}

const CatalogView = (props: CatalogViewProps) => {
  const [catalog, setCatalog] = useState(false);

  const rewards = useMemo(() => {
    const rewards = props.catalog?.catalog.progress?.rewards ?? [];
    rewards.sort((a, b) => {
      if (a.state === "ACCEPTED" && b.state !== "ACCEPTED") {
        return 1;
      }
      if (a.state !== "ACCEPTED" && b.state === "ACCEPTED") {
        return -1;
      }
      return a.level - b.level;
    });
    return rewards;
  }, [props.catalog]);
  const isAllAccepted = useMemo(() => (rewards[0]?.state ?? "") === "ACCEPTED", [rewards]);

  const onCatalogPress = () => {
    setCatalog(true);
  };
  const onCatalogClose = () => {
    setCatalog(false);
  };

  const renderItem = (reward: { item: CatalogReward; index: number }) => {
    return (
      <VStack
        style={
          reward.index % 2 === 0
            ? [ViewStyles.pl4, ViewStyles.pr1]
            : [ViewStyles.pl1, ViewStyles.pr4]
        }
      >
        <RewardBox
          last={reward.index === rewards.length - 2 || reward.index === rewards.length - 1}
          isAccepted={!isAllAccepted && reward.item.state === "ACCEPTED"}
          level={reward.item.level}
          image={getImageCacheSource(reward.item.item.image.url)}
          // TODO: need translation.
          name={reward.item.item.name}
          primaryAbility={
            reward.item.item.primaryGearPower
              ? getImageCacheSource(reward.item.item.primaryGearPower.image.url)
              : undefined
          }
          recyclingKey={reward.item.item.id}
        />
      </VStack>
    );
  };

  return (
    <Center style={props.style}>
      {!props.catalog && <Badge color={Color.AccentColor} title={props.catalogLevel} />}
      {props.catalog && (
        <BadgeButton
          color={Color.AccentColor}
          title={props.catalogLevel}
          onPress={onCatalogPress}
        />
      )}
      <MasonryFlashModal
        isVisible={catalog}
        data={rewards}
        column={2}
        keyExtractor={(reward) => reward.level.toString()}
        renderItem={renderItem}
        estimatedItemSize={128}
        onClose={onCatalogClose}
        style={[
          ViewStyles.modal2d,
          // HACK: fixed height should be provided to FlashList.
          {
            height: (136 * ((props.catalog?.catalog.progress?.rewards.length ?? 0) + 1)) / 2 - 8,
            paddingHorizontal: 0,
          },
        ]}
      />
    </Center>
  );
};

export default CatalogView;
