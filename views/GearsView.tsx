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

interface GearsViewProps {
  disabled?: boolean;
  onPress: () => Promise<MyOutfitCommonDataEquipmentsResult | undefined>;
  style?: StyleProp<ViewStyle>;
}

const GearsView = (props: GearsViewProps) => {
  const [equipments, setEquipments] = useState<MyOutfitCommonDataEquipmentsResult>();
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState(false);
  const [filterIndex, setFilterIndex] = useState(0);
  const [filter, setFilter] = useState(GearType.HeadGears);

  useEffect(() => {
    switch (filterIndex) {
      case 0:
        setFilter(GearType.HeadGears);
        break;
      case 1:
        setFilter(GearType.ClothingGears);
        break;
      case 2:
        setFilter(GearType.ShoesGears);
        break;
      default:
        throw new Error(`unexpected filter index ${filterIndex}`);
    }
  }, [filterIndex]);

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
  const onClose = () => {
    setDisplay(false);
  };
  const onModalHide = () => {
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
        paddingTo={getGearPadding(equipments![filter].nodes)}
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
        data={equipments?.[filter].nodes ?? []}
        keyExtractor={(gear) => gear.name}
        renderItem={renderItem}
        estimatedItemSize={48}
        ListHeaderComponent={
          <VStack style={ViewStyles.px4}>
            <SegmentedControl
              values={Object.values(GearType).map((type) => t(formatGearTypeName(type)))}
              selectedIndex={filterIndex}
              onChange={onFilterChange}
              style={ViewStyles.mb2}
            />
          </VStack>
        }
        onClose={onClose}
        onModalHide={onModalHide}
        style={[
          ViewStyles.modal1d,
          // HACK: fixed height should be provided to FlashList.
          { height: 72 + 48 * (equipments?.[filter].nodes.length ?? 0), paddingHorizontal: 0 },
        ]}
      />
    </Center>
  );
};

export default GearsView;
