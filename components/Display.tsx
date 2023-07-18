import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Icon, { IconName } from "./Icon";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles, useTheme } from "./Styles";

interface DisplayProps {
  isFirst?: boolean;
  isLast?: boolean;
  level?: number;
  icon?: IconName;
  title: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const Display = (props: DisplayProps) => {
  const theme = useTheme();

  return (
    <HStack
      style={[
        ViewStyles.px3,
        { height: 32 },
        props.isFirst && ViewStyles.rt2,
        props.isLast && ViewStyles.rb2,
        theme.territoryStyle,
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
          <HStack style={{ width: 16 * (props.level ?? 0) }} />
          {!!props.icon && (
            <Icon name={props.icon} size={14} color={theme.textColor} style={ViewStyles.mr0_5} />
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
  expand?: boolean;
  subChildren?: React.ReactNode;
}

const AccordionDisplay = (props: AccordionDisplayProps) => {
  const { subChildren, isLast, ...rest } = props;

  const [expand, setExpand] = useState(props.expand ?? false);

  const onPress = () => {
    setExpand(!expand);
  };

  if (subChildren === undefined || React.Children.count(subChildren) === 0) {
    return <Display {...props} />;
  }

  return (
    <VStack>
      <Pressable onPress={onPress} style={{ backgroundColor: "transparent" }}>
        <Display
          isLast={isLast && !expand}
          icon={expand ? "chevron-down" : "chevron-right"}
          {...rest}
        />
      </Pressable>
      {expand && subChildren}
    </VStack>
  );
};

export { Display, AccordionDisplay };
