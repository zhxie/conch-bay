import { useMemo, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  GearBox,
  Modal,
  Notice,
  ScheduleButton,
  TitledList,
  VStack,
  ViewStyles,
  useTheme,
} from "../components";
import t from "../i18n";
import { PickupBrand, SaleGear, Shop } from "../models/types";
import { getGearPadding, getImageCacheSource, getImageHash } from "../utils/ui";

interface ShopViewProps {
  shop: Shop;
  style?: StyleProp<ViewStyle>;
}

const ShopView = (props: ShopViewProps) => {
  const theme = useTheme();

  const [displayShop, setDisplayShop] = useState(false);

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

  const onShopPress = () => {
    setDisplayShop(true);
  };
  const onShopDismiss = () => {
    setDisplayShop(false);
  };

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
      <Modal isVisible={displayShop} size="medium" onDismiss={onShopDismiss}>
        <TitledList color={theme.textColor} title={t("gesotown")}>
          {pickupBrand && (
            <VStack center style={ViewStyles.mb2}>
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
            <VStack center style={ViewStyles.mb2}>
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
          <VStack style={ViewStyles.wf}>
            <Notice title={t("shop_notice")} />
          </VStack>
        </TitledList>
      </Modal>
    </>
  );
};

export default ShopView;
