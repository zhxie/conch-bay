import { useState } from "react";
import { Linking, StyleProp, ViewStyle } from "react-native";
import {
  Button,
  Color,
  FilterButton,
  FlashModal,
  GearBox,
  HStack,
  Marquee,
  Modal,
  ScheduleButton,
  TitledList,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import { MyGear, MyOutfitCommonDataEquipmentsResult, Shop } from "../models/types";
import { getGearPadding, getImageCacheSource } from "../utils/ui";

enum GearType {
  HeadGears = "headGears",
  ClothingGears = "clothingGears",
  ShoesGears = "shoesGears",
}

interface ShopViewProps {
  shop: Shop;
  isEquipmentsAvailable: boolean;
  style?: StyleProp<ViewStyle>;
  onRefresh: () => Promise<MyOutfitCommonDataEquipmentsResult | undefined>;
}

const ShopView = (props: ShopViewProps) => {
  const theme = useTheme();

  const [displayShop, setDisplayShop] = useState(false);
  const [equipments, setEquipments] = useState<MyOutfitCommonDataEquipmentsResult>();
  const [displayEquipments, setDisplayEquipments] = useState(false);
  const [filter, setFilter] = useState<GearType>(GearType.HeadGears);

  const formatGearTypeName = (type: GearType) => {
    switch (type) {
      case GearType.HeadGears:
        return "headgear";
      case GearType.ClothingGears:
        return "clothes";
      case GearType.ShoesGears:
        return "shoes";
    }
  };

  const onShopPress = () => {
    setDisplayShop(true);
  };
  const onDisplayShopClose = () => {
    if (!displayEquipments) {
      setDisplayShop(false);
    }
  };
  const onOrderInNintendoSwitchOnlinePress = async () => {
    await Linking.openURL("com.nintendo.znca://znca/game/4834290508791808?p=/gesotown");
  };
  const onDisplayMyGearsPress = async () => {
    setDisplayEquipments(true);
    const equipments = await props.onRefresh();
    if (equipments) {
      setEquipments(equipments);
    } else {
      setDisplayEquipments(false);
    }
  };
  const onDisplayMyGearsClose = () => {
    setDisplayEquipments(false);
  };
  const onDisplayMyGearsHide = () => {
    setEquipments(undefined);
  };

  const renderItem = (gear: { item: MyGear; index: number }) => (
    <VStack style={ViewStyles.px4}>
      <GearBox
        isFirst={gear.index === 0}
        isLast={gear.index === equipments![filter].nodes.length - 1}
        image={getImageCacheSource(gear.item.image.url)}
        brandImage={getImageCacheSource(gear.item.brand.image.url)}
        // TODO: need translation.
        name={gear.item.name}
        brand={t(gear.item.brand.id)}
        primaryAbility={getImageCacheSource(gear.item.primaryGearPower.image.url)}
        additionalAbility={gear.item.additionalGearPowers.map((gearPower) =>
          getImageCacheSource(gearPower.image.url)
        )}
        recyclingKey={gear.item.name}
        paddingTo={getGearPadding(equipments![filter].nodes)}
      />
    </VStack>
  );

  return (
    <>
      <ScheduleButton
        color={theme.textColor}
        rule={t("gesotown")}
        stages={[t(props.shop.gesotown.pickupBrand.brand.id)].concat(
          props.shop.gesotown.limitedGears.length > 0
            ? [props.shop.gesotown.limitedGears[0].gear.name]
            : []
        )}
        onPress={onShopPress}
        style={props.style}
      />
      <Modal isVisible={displayShop} onClose={onDisplayShopClose} style={ViewStyles.modal2d}>
        <TitledList color={theme.textColor} title={t("gesotown")}>
          <VStack center style={ViewStyles.mb2}>
            {props.shop.gesotown.pickupBrand.brandGears.map((gear, i, gears) => (
              <GearBox
                key={gear.id}
                isFirst={i === 0}
                isLast={i === gears.length - 1}
                image={getImageCacheSource(gear.gear.image.url)}
                brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                name={gear.gear.name}
                brand={t(gear.gear.brand.id)}
                primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                  getImageCacheSource(gearPower.image.url)
                )}
                paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
              />
            ))}
          </VStack>
          <VStack center style={ViewStyles.mb2}>
            {props.shop.gesotown.limitedGears.map((gear, i, gears) => (
              <GearBox
                key={gear.id}
                isFirst={i === 0}
                isLast={i === gears.length - 1}
                image={getImageCacheSource(gear.gear.image.url)}
                brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                name={gear.gear.name}
                brand={t(gear.gear.brand.id)}
                primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                  getImageCacheSource(gearPower.image.url)
                )}
                paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
              />
            ))}
          </VStack>
          <VStack style={ViewStyles.wf}>
            <Button
              style={[props.isEquipmentsAvailable && ViewStyles.mb2, ViewStyles.accent]}
              onPress={onOrderInNintendoSwitchOnlinePress}
            >
              <Marquee style={theme.reverseTextStyle}>
                {t("order_in_nintendo_switch_online")}
              </Marquee>
            </Button>
            {props.isEquipmentsAvailable && (
              <Button
                isLoading={!equipments && displayEquipments}
                isLoadingText={t("loading_owned_gears")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onDisplayMyGearsPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("display_owned_gears")}</Marquee>
              </Button>
            )}
          </VStack>
        </TitledList>
        <FlashModal
          isVisible={!!equipments && displayEquipments}
          data={equipments?.[filter].nodes ?? []}
          keyExtractor={(gear) => gear.name}
          renderItem={renderItem}
          estimatedItemSize={48}
          ListHeaderComponent={
            <HStack style={[ViewStyles.pl4, ViewStyles.pr2, { flexWrap: "wrap" }]}>
              {Object.values(GearType).map((type) => (
                <FilterButton
                  key={type}
                  textColor={filter === type ? Color.DarkText : undefined}
                  title={t(formatGearTypeName(type))}
                  style={[ViewStyles.mr2, ViewStyles.mb2, filter === type && ViewStyles.accent]}
                  onPress={() => {
                    setFilter(type);
                  }}
                />
              ))}
            </HStack>
          }
          onClose={onDisplayMyGearsClose}
          onModalHide={onDisplayMyGearsHide}
          style={[
            ViewStyles.modal1d,
            // HACK: fixed height should be provided to FlashList.
            { height: 72 + 48 * (equipments?.[filter].nodes.length ?? 0), paddingHorizontal: 0 },
          ]}
        />
      </Modal>
    </>
  );
};

export default ShopView;
