import React, { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  Area,
  Chart as RLChart,
  Line,
  Padding,
  VerticalAxis,
} from "react-native-responsive-linechart";
import { Color, TextStyles, useTheme } from "./Styles";

interface ChartData {
  data: number[];
  color: string;
  max?: number;
  relative?: boolean;
  dash?: boolean;
}

interface LineProps {
  data: number[];
  color: string;
  dash?: boolean;
}

const AreaLine = (props: LineProps) => {
  const theme = useTheme();

  const data = useMemo(() => props.data.map((datum, i) => ({ x: i, y: datum })), [props.data]);

  return (
    <>
      <Area
        data={data}
        smoothing="cubic-spline"
        theme={{
          gradient: {
            from: { color: props.color },
            to: { color: props.color, opacity: 0 },
          },
        }}
      />
      {/* HACK: using scatter line will lead to layout area over lines. */}
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { color: props.color, width: 3, dashArray: props.dash ? [5] : [] },
          scatter: {
            default: {
              width: 6,
              height: 6,
              rx: 6,
              color: theme.territoryColor,
              border: {
                width: 2,
                color: props.color,
                opacity: 1,
              },
            },
          },
        }}
      />
    </>
  );
};

const ScatterLine = (props: LineProps) => {
  const theme = useTheme();

  const data = useMemo(() => props.data.map((datum, i) => ({ x: i, y: datum })), [props.data]);

  return (
    <>
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { color: props.color, width: 3, dashArray: props.dash ? [5] : [] },
          scatter: {
            default: {
              width: 6,
              height: 6,
              rx: 6,
              color: theme.territoryColor,
              border: {
                width: 2,
                color: props.color,
                opacity: 1,
              },
            },
          },
        }}
      />
    </>
  );
};

interface ChartProps {
  dataGroup: ChartData[];
  padding?: Padding;
  style?: StyleProp<ViewStyle>;
}

const Chart = (props: ChartProps) => {
  const max = useMemo(
    () =>
      Math.max(
        ...props.dataGroup
          .filter((data) => !data.relative)
          .map((data) => {
            if (data.max !== undefined) {
              return data.max;
            }
            return Math.max(...data.data);
          }),
        0,
      ) || 100,
    [props.dataGroup],
  );

  const normalize = (data: ChartData) => {
    if (!data.relative) {
      return data.data;
    }

    return data.data.map((datum) => (datum / (data.max || Math.max(...data.data))) * max);
  };

  return (
    <RLChart
      style={props.style}
      xDomain={{ min: 0, max: props.dataGroup[0].data.length - 1 }}
      yDomain={{
        min: 0 - max * 0.067,
        max: max + max * 0.067,
      }}
      disableTouch
      disableGestures
      padding={props.padding || { bottom: 0, top: 0 }}
    >
      <VerticalAxis
        tickValues={[0, max / 2, max]}
        theme={{
          axis: { visible: false },
          grid: { stroke: { color: Color.MiddleTerritory, opacity: 0.5, dashArray: [5] } },
          ticks: { visible: false },
          labels: {
            label: { ...TextStyles.subtle, dx: 40 },
            formatter: (v) => v.toFixed(1),
          },
        }}
      />
      {props.dataGroup.map((data, i, dataGroup) =>
        dataGroup.length === 1 ? (
          <AreaLine key={i} data={normalize(data)} color={data.color} dash={data.dash} />
        ) : (
          <ScatterLine key={i} data={normalize(data)} color={data.color} dash={data.dash} />
        ),
      )}
    </RLChart>
  );
};

export default Chart;
