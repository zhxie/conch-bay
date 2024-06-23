import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from "@react-native-segmented-control/segmented-control";
import { useEffect, useState } from "react";
import { NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import { Center, FlashModal, GearBox, ToolButton, ViewStyles, VStack } from "../components";
import t from "../i18n";
import { MyGear, MyOutfitCommonDataEquipmentsResult } from "../models/types";
import { getGearPadding, getImageCacheSource, getImageHash } from "../utils/ui";

enum GearType {
  HeadGears = "headGears",
  ClothingGears = "clothingGears",
  ShoesGears = "shoesGears",
}

enum Sort {
  Default = "default",
  Brand = "brand",
  Ability = "ability",
}

interface GearsViewProps {
  disabled?: boolean;
  onPress: () => Promise<MyOutfitCommonDataEquipmentsResult | undefined>;
  style?: StyleProp<ViewStyle>;
}

const GearsView = (props: GearsViewProps) => {
  const [equipments, setEquipments] = useState<MyOutfitCommonDataEquipmentsResult>();
  const [headgears, setHeadgears] = useState<MyGear[]>([]);
  const [clothes, setClothes] = useState<MyGear[]>([]);
  const [shoes, setShoes] = useState<MyGear[]>([]);
  const [gears, setGears] = useState<MyGear[]>([]);
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState(false);
  const [filterIndex, setFilterIndex] = useState(0);
  const [sortIndex, setSortIndex] = useState(0);

  useEffect(() => {
    const headgears: MyGear[] = [],
      clothes: MyGear[] = [],
      shoes: MyGear[] = [];
    if (equipments) {
      for (const headgear of equipments.headGears.nodes) {
        headgears.push(headgear);
      }
      for (const cloth of equipments.clothingGears.nodes) {
        clothes.push(cloth);
      }
      for (const shoe of equipments.shoesGears.nodes) {
        shoes.push(shoe);
      }
      setHeadgears(headgears);
      setClothes(clothes);
      setShoes(shoes);
    }
  }, [equipments]);
  useEffect(() => {
    const gears: MyGear[] = [];
    switch (filterIndex) {
      case 0:
        for (const headgear of headgears) {
          gears.push(headgear);
        }
        break;
      case 1:
        for (const cloth of clothes) {
          gears.push(cloth);
        }
        break;
      case 2:
        for (const shoe of shoes) {
          gears.push(shoe);
        }
        break;
      default:
        throw new Error(`unexpected filter index ${filterIndex}`);
    }
    switch (sortIndex) {
      case 0:
        break;
      case 1:
        gears.sort((a, b) => a.brand.id.localeCompare(b.brand.id));
        break;
      case 2:
        gears.sort((a, b) => a.primaryGearPower.gearPowerId - b.primaryGearPower.gearPowerId);
        break;
      default:
        throw new Error(`unexpected sort index ${filterIndex}`);
    }
    setGears(gears);
  }, [headgears, clothes, shoes, filterIndex, sortIndex]);

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

  const onPress = async () => {
    setLoading(true);
    const equipments = await props.onPress();
    if (equipments) {
      setEquipments(equipments);
      setDisplay(true);
    }
    setLoading(false);
  };
  const onFilterChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setFilterIndex(event.nativeEvent.selectedSegmentIndex);
  };
  const onSortChange = (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
    setSortIndex(event.nativeEvent.selectedSegmentIndex);
  };
  const onDismiss = () => {
    setDisplay(false);
    setEquipments(undefined);
  };

  const renderItem = (gear: { item: MyGear; index: number }) => (
    <VStack style={ViewStyles.px4}>
      <GearBox
        first={gear.index === 0}
        last={gear.index === gears.length - 1}
        image={getImageCacheSource(gear.item.image.url)}
        brandImage={getImageCacheSource(gear.item.brand.image.url)}
        name={t(getImageHash(gear.item.image.url), { defaultValue: gear.item.name })}
        brand={t(gear.item.brand.id)}
        primaryAbility={getImageCacheSource(gear.item.primaryGearPower.image.url)}
        additionalAbility={gear.item.additionalGearPowers.map((gearPower) =>
          getImageCacheSource(gearPower.image.url)
        )}
        paddingTo={getGearPadding(gears)}
      />
    </VStack>
  );

  return (
    <Center style={props.style}>
      <ToolButton
        disabled={props.disabled}
        loading={loading}
        icon="shirt"
        title={t("gears")}
        onPress={onPress}
      />
      <FlashModal
        isVisible={display}
        size="medium"
        noPadding
        data={gears}
        keyExtractor={(gear) => gear.name}
        renderItem={renderItem}
        estimatedItemSize={48}
        estimatedHeight={72 + 48 * gears.length}
        ListHeaderComponent={
          <VStack style={ViewStyles.px4}>
            <SegmentedControl
              values={Object.values(GearType).map((type) => t(formatGearTypeName(type)))}
              selectedIndex={filterIndex}
              onChange={onFilterChange}
              style={ViewStyles.mb1}
            />
            <SegmentedControl
              values={Object.values(Sort).map((sort) => t(sort))}
              selectedIndex={sortIndex}
              onChange={onSortChange}
              style={ViewStyles.mb2}
            />
          </VStack>
        }
        onDismiss={onDismiss}
      />
    </Center>
  );
};

export default GearsView;
