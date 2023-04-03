import { useState } from "react";
import { Linking, StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Button,
  Color,
  GearBox,
  Marquee,
  Modal,
  ScheduleButton,
  TextStyles,
  TitledList,
  VStack,
  ViewStyles,
} from "../components";
import t from "../i18n";
import { Shop } from "../models/types";
import { getGearPadding, getImageCacheSource } from "../utils/ui";

interface ShopViewProps {
  shop: Shop;
  style?: StyleProp<ViewStyle>;
}

const ShopView = (props: ShopViewProps) => {
  const colorScheme = useColorScheme();
  const shopColor = colorScheme === "light" ? Color.LightText : Color.DarkText;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const [displayShop, setDisplayShop] = useState(false);

  const onShopPress = () => {
    setDisplayShop(true);
  };
  const onDisplayShopClose = () => {
    setDisplayShop(false);
  };
  const onOrderInNintendoSwitchOnlinePress = async () => {
    await Linking.openURL("com.nintendo.znca://znca/game/4834290508791808?p=/gesotown");
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
            <Button style={ViewStyles.accent} onPress={onOrderInNintendoSwitchOnlinePress}>
              <Marquee style={reverseTextColor}>{t("order_in_nintendo_switch_online")}</Marquee>
            </Button>
          </VStack>
        </TitledList>
      </Modal>
    </>
  );
};

export default ShopView;
