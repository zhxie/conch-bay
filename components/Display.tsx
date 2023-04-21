import React, { useState } from "react";
import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import Icon from "./Icon";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { HStack, VStack } from "./Stack";
import { Color, TextStyles, ViewStyles } from "./Styles";

interface DisplayProps {
  isFirst?: boolean;
  isLast?: boolean;
  icon?: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const Display = (props: DisplayProps) => {
  const colorScheme = useColorScheme();
  const style = colorScheme === "light" ? ViewStyles.lightTerritory : ViewStyles.darkTerritory;
  const arrowColor = colorScheme === "light" ? Color.LightText : Color.DarkText;

  return (
    <HStack
      style={[
        ViewStyles.px3,
        { height: 32 },
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        style,
        props.style,
      ]}
    >
      <HStack
        flex
        center
        justify
        style={[!props.isFirst && ViewStyles.sept, !props.isLast && ViewStyles.sepb]}
      >
        <HStack flex center style={ViewStyles.mr1}>
          {!!props.icon && (
            <Icon
              // HACK: forcly cast.
              name={props.icon as any}
              size={14}
              color={arrowColor}
              style={ViewStyles.mr0_5}
            />
          )}
          <HStack flex>
            <Marquee style={TextStyles.b}>{props.title}</Marquee>
          </HStack>
        </HStack>
        <HStack center>{props.children}</HStack>
      </HStack>
    </HStack>
  );
};

interface AccordionDisplayProps extends DisplayProps {
  subChildren?: React.ReactNode;
}

const AccordionDisplay = (props: AccordionDisplayProps) => {
  const { subChildren, isLast, ...rest } = props;

  const [expand, setExpand] = useState(false);

  const onPress = () => {
    setExpand(!expand);
  };

  if (props.subChildren === undefined || React.Children.count(props.subChildren) === 0) {
    return <Display {...props} />;
  }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor: "transparent" }}>
      <VStack>
        <Display
          isLast={isLast && !expand}
          icon={expand ? "chevron-down" : "chevron-right"}
          {...rest}
        />
        {expand && props.subChildren}
      </VStack>
    </Pressable>
  );
};

export { Display, AccordionDisplay };
