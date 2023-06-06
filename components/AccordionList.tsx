import React, { ForwardedRef, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import { HStack, VStack } from "./Stack";

interface AccordionListProps {
  column: number;
  collapsedStyle?: StyleProp<ViewStyle>;
  expandedStyle?: StyleProp<ViewStyle>;
  collapsedContainerStyle?: StyleProp<ViewStyle>;
  expandedContainerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  expandedChildrenStyleOverride?: StyleProp<ViewStyle>;
}

interface AccordionListHandle {
  expand: () => void;
  collapse: () => void;
}

const AccordionList = forwardRef(
  (props: AccordionListProps, ref: ForwardedRef<AccordionListHandle>) => {
    useImperativeHandle(
      ref,
      () => {
        return {
          expand: () => {
            setExpand(true);
          },
          collapse: () => {
            setExpand(false);
          },
        };
      },
      []
    );

    const styledChildren = useMemo(
      () =>
        React.Children.toArray(props.children)
          .filter(Boolean)
          .map((child: any) =>
            React.cloneElement(child, { style: props.expandedChildrenStyleOverride })
          ),
      [(props.children, props.expandedChildrenStyleOverride)]
    );
    const count = React.Children.count(styledChildren);

    const [expand, setExpand] = useState(false);

    if (expand) {
      return (
        <VStack flex style={props.expandedStyle}>
          {new Array(Math.floor((count + (props.column - 1)) / props.column))
            .fill(0)
            .map((_, i) => (
              <HStack key={i} center justify style={props.expandedContainerStyle}>
                {new Array(props.column)
                  .fill(0)
                  .map(
                    (_, j) =>
                      styledChildren[i * props.column + j] || (
                        <VStack key={j} style={props.expandedChildrenStyleOverride} />
                      )
                  )}
              </HStack>
            ))}
        </VStack>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={props.collapsedStyle}>
        <HStack center style={props.collapsedContainerStyle}>
          {props.children}
        </HStack>
      </ScrollView>
    );
  }
);

export { AccordionListHandle };
export default AccordionList;
