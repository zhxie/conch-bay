import { useState } from "react";
import { Linking, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Button,
  Color,
  FilterButton,
  GearBox,
  HStack,
  Marquee,
  Modal,
  ScheduleButton,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { MyOutfitCommonDataEquipmentsResult, Shop } from "../models/types";
import { getGearPadding, getImageCacheSource } from "../utils/ui";

interface ShopViewProps {
  shop: Shop;
  isEquipmentsAvailable: boolean;
  style?: StyleProp<ViewStyle>;
  onRefresh: () => Promise<MyOutfitCommonDataEquipmentsResult | undefined>;
}

const ShopView = (props: ShopViewProps) => {
  const colorScheme = useColorScheme();
  const shopColor = colorScheme === "light" ? Color.LightText : Color.DarkText;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [displayShop, setDisplayShop] = useState(false);
  const [equipments, setEquipments] = useState<MyOutfitCommonDataEquipmentsResult>();
  const [displayEquipments, setDisplayEquipments] = useState(false);
  const [filter, setFilter] = useState("headGears");

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
    setEquipments(equipments);
  };
  const onDisplayMyGearsClose = () => {
    setDisplayEquipments(false);
  };
  const onDisplayMyGearsHide = () => {
    setEquipments(undefined);
  };

  return (
    <>
      <ScheduleButton
        color={shopColor}
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
        <TitledList color={shopColor} title={t("gesotown")}>
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
              <Marquee style={reverseTextColor}>{t("order_in_nintendo_switch_online")}</Marquee>
            </Button>
            {props.isEquipmentsAvailable && (
              <Button
                isLoading={!equipments && displayEquipments}
                isLoadingText={t("loading_owned_gears")}
                style={ViewStyles.accent}
                textStyle={reverseTextColor}
                onPress={onDisplayMyGearsPress}
              >
                <Marquee style={reverseTextColor}>{t("display_owned_gears")}</Marquee>
              </Button>
            )}
          </VStack>
        </TitledList>
        <Modal
          isVisible={!!equipments && displayEquipments}
          onClose={onDisplayMyGearsClose}
          onModalHide={onDisplayMyGearsHide}
          style={ViewStyles.modal1d}
        >
          {equipments && (
            <VStack>
              <HStack style={{ flexWrap: "wrap" }}>
                <FilterButton
                  color={filter === "headGears" ? Color.AccentColor : undefined}
                  textColor={Color.DarkText}
                  title={t("headgear")}
                  style={[ViewStyles.mr2, ViewStyles.mb2]}
                  onPress={() => {
                    setFilter("headGears");
                  }}
                />
                <FilterButton
                  color={filter === "clothingGears" ? Color.AccentColor : undefined}
                  textColor={Color.DarkText}
                  title={t("clothes")}
                  style={[ViewStyles.mr2, ViewStyles.mb2]}
                  onPress={() => {
                    setFilter("clothingGears");
                  }}
                />
                <FilterButton
                  color={filter === "shoesGears" ? Color.AccentColor : undefined}
                  textColor={Color.DarkText}
                  title={t("shoes")}
                  style={[ViewStyles.mr2, ViewStyles.mb2]}
                  onPress={() => {
                    setFilter("shoesGears");
                  }}
                />
              </HStack>
              <VStack center>
                {equipments[filter].nodes.map((gear, i, gears) => (
                  <GearBox
                    key={i}
                    isFirst={i === 0}
                    isLast={i === gears.length - 1}
                    image={getImageCacheSource(gear.image.url)}
                    brandImage={getImageCacheSource(gear.brand.image.url)}
                    name={gear.name}
                    brand={t(gear.brand.id)}
                    primaryAbility={getImageCacheSource(gear.primaryGearPower.image.url)}
                    additionalAbility={gear.additionalGearPowers.map((gearPower) =>
                      getImageCacheSource(gearPower.image.url)
                    )}
                    paddingTo={getGearPadding(gears)}
                  />
                ))}
              </VStack>
            </VStack>
          )}
        </Modal>
      </Modal>
    </>
  );
};

export default ShopView;
