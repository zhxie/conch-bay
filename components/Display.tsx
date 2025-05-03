import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Icon, { IconName } from "./Icon";
import Marquee from "./Marquee";
import Pressable from "./Pressable";
import { HStack, VStack } from "./Stack";
import { TextStyles, ViewStyles, useTheme } from "./Styles";

interface DisplayProps {
  first?: boolean;
  last?: boolean;
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
        props.first && ViewStyles.rt2,
        props.last && ViewStyles.rb2,
        theme.territoryStyle,
        props.style,
      ]}
    >
      <HStack
        flex
        center
        justify
        style={[!props.first && ViewStyles.sept, !props.last && ViewStyles.sepb]}
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

interface AccordionDisplayHandle {
  expand: () => void;
  collapse: () => void;
}

interface AccordionDisplayProps extends DisplayProps {
  expand?: boolean;
  subChildren?: React.ReactNode;
}

const AccordionDisplay = forwardRef(
  (props: AccordionDisplayProps, ref: ForwardedRef<AccordionDisplayHandle>) => {
    const { subChildren, last, ...rest } = props;

    useImperativeHandle(ref, () => {
      return {
        expand: () => {
          setExpand(true);
        },
        collapse: () => {
          setExpand(false);
        },
      };
    });

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
            last={last && !expand}
            icon={expand ? "chevron-down" : "chevron-right"}
            {...rest}
          />
        </Pressable>
        {expand && subChildren}
      </VStack>
    );
  },
);

export { Display, AccordionDisplay, AccordionDisplayHandle };
