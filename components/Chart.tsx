import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Area,
  Chart as RLChart,
  Line,
  Padding,
  VerticalAxis,
} from "react-native-responsive-linechart";
import { Color, TextStyles } from "./Styles";

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
  const colorScheme = useColorScheme();
  const color = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;

  const data = props.data.map((datum, i) => ({ x: i, y: datum }));

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
      {/* TODO: using scatter line will lead to layout area over lines. */}
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { color: props.color, width: 3, dashArray: props.dash ? [5] : [] },
          scatter: {
            default: {
              width: 8,
              height: 8,
              rx: 8,
              color: props.color,
            },
          },
        }}
      />
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { width: 0 },
          scatter: {
            default: {
              width: 4,
              height: 4,
              rx: 4,
              color,
            },
          },
        }}
      />
    </>
  );
};

const ScatterLine = (props: LineProps) => {
  const colorScheme = useColorScheme();
  const color = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;

  const data = props.data.map((datum, i) => ({ x: i, y: datum }));

  return (
    <>
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { color: props.color, width: 3, dashArray: props.dash ? [5] : [] },
          scatter: {
            default: {
              width: 8,
              height: 8,
              rx: 8,
              color: props.color,
            },
          },
        }}
      />
      <Line
        data={data}
        smoothing="cubic-spline"
        theme={{
          stroke: { width: 0 },
          scatter: {
            default: {
              width: 4,
              height: 4,
              rx: 4,
              color,
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
  const max =
    Math.max(
      ...props.dataGroup
        .filter((data) => !data.relative)
        .map((data) => {
          if (data.max !== undefined) {
            return data.max;
          }
          return Math.max(...data.data);
        }),
      0
    ) || 100;

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
        min: 0,
        max: max,
      }}
      disableTouch
      disableGestures
      padding={props.padding || { bottom: 10, top: 10 }}
    >
      <VerticalAxis
        tickCount={3}
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
        )
      )}
    </RLChart>
  );
};

export default Chart;
