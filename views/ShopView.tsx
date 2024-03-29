import { useMemo, useState } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import {
  Button,
  Color,
  FilterButton,
  FlashModal,
  GearBox,
  Marquee,
  Modal,
  Notice,
  ScheduleButton,
  TitledList,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import {
  MyGear,
  MyOutfitCommonDataEquipmentsResult,
  PickupBrand,
  SaleGear,
  Shop,
} from "../models/types";
import { getGearPadding, getImageCacheSource, getImageHash } from "../utils/ui";

enum GearType {
  HeadGears = "headGears",
  ClothingGears = "clothingGears",
  ShoesGears = "shoesGears",
}

interface ShopViewProps {
  shop: Shop;
  style?: StyleProp<ViewStyle>;
  onRefresh?: () => Promise<MyOutfitCommonDataEquipmentsResult | undefined>;
}

const ShopView = (props: ShopViewProps) => {
  const theme = useTheme();

  const [displayShop, setDisplayShop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState<MyOutfitCommonDataEquipmentsResult>();
  const [displayEquipments, setDisplayEquipments] = useState(false);
  const [filter, setFilter] = useState<GearType>(GearType.HeadGears);

  const isGearExpired = (gear: SaleGear | PickupBrand) => {
    const now = new Date().getTime();
    const date = new Date(gear.saleEndTime);
    const timestamp = date.getTime();
    return timestamp <= now;
  };

  const pickupBrand = isGearExpired(props.shop.gesotown.pickupBrand)
    ? undefined
    : props.shop.gesotown.pickupBrand;
  const limitedGears = useMemo(
    () => props.shop.gesotown.limitedGears.filter((gear) => !isGearExpired(gear)),
    [props.shop]
  );

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
    if (!loading) {
      setDisplayShop(false);
    }
  };
  const onShowMyGearsPress = async () => {
    setLoading(true);
    const equipments = await props.onRefresh!();
    if (equipments) {
      setEquipments(equipments);
      setDisplayEquipments(true);
    }
    setLoading(false);
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
        first={gear.index === 0}
        last={gear.index === equipments![filter].nodes.length - 1}
        image={getImageCacheSource(gear.item.image.url)}
        brandImage={getImageCacheSource(gear.item.brand.image.url)}
        name={t(getImageHash(gear.item.image.url), { defaultValue: gear.item.name })}
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
        stages={(pickupBrand ? [t(pickupBrand.brand.id)] : []).concat(
          limitedGears.length > 0
            ? [
                t(getImageHash(limitedGears[0].gear.image.url), {
                  defaultValue: limitedGears[0].gear.name,
                }),
              ]
            : []
        )}
        onPress={onShopPress}
        style={props.style}
      />
      <Modal isVisible={displayShop} onClose={onDisplayShopClose} style={ViewStyles.modal2d}>
        <TitledList color={theme.textColor} title={t("gesotown")}>
          {pickupBrand && (
            <VStack center style={(limitedGears.length > 0 || !!props.onRefresh) && ViewStyles.mb2}>
              {pickupBrand.brandGears.map((gear, i, gears) => (
                <GearBox
                  key={gear.id}
                  first={i === 0}
                  last={i === gears.length - 1}
                  image={getImageCacheSource(gear.gear.image.url)}
                  brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                  name={t(getImageHash(gear.gear.image.url), { defaultValue: gear.gear.name })}
                  brand={t(gear.gear.brand.id)}
                  primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                  additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                    getImageCacheSource(gearPower.image.url)
                  )}
                  paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
                />
              ))}
            </VStack>
          )}
          {limitedGears.length > 0 && (
            <VStack center style={!!props.onRefresh && ViewStyles.mb2}>
              {limitedGears.map((gear, i, gears) => (
                <GearBox
                  key={gear.id}
                  first={i === 0}
                  last={i === gears.length - 1}
                  image={getImageCacheSource(gear.gear.image.url)}
                  brandImage={getImageCacheSource(gear.gear.brand.image.url)}
                  name={t(getImageHash(gear.gear.image.url), { defaultValue: gear.gear.name })}
                  brand={t(gear.gear.brand.id)}
                  primaryAbility={getImageCacheSource(gear.gear.primaryGearPower.image.url)}
                  additionalAbility={gear.gear.additionalGearPowers.map((gearPower) =>
                    getImageCacheSource(gearPower.image.url)
                  )}
                  paddingTo={getGearPadding(gears.map((gear) => gear.gear))}
                />
              ))}
            </VStack>
          )}
          {!!props.onRefresh && (
            <VStack style={ViewStyles.wf}>
              <Button
                loading={loading}
                loadingText={t("loading_owned_gears")}
                style={[ViewStyles.mb2, ViewStyles.accent]}
                textStyle={theme.reverseTextStyle}
                onPress={onShowMyGearsPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("show_owned_gears")}</Marquee>
              </Button>
              <Notice title={t("shop_notice")} />
            </VStack>
          )}
        </TitledList>
        <FlashModal
          isVisible={displayEquipments}
          data={equipments?.[filter].nodes ?? []}
          keyExtractor={(gear) => gear.name}
          renderItem={renderItem}
          estimatedItemSize={48}
          ListHeaderComponent={
            <ScrollView horizontal style={ViewStyles.px4}>
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
            </ScrollView>
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
