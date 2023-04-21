import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import {
  Area,
  Chart,
  ChartDataPoint,
  Line,
  Padding,
  VerticalAxis,
} from "react-native-responsive-linechart";
import { Color, TextStyles } from "./Styles";

interface AreaChartProps {
  data: ChartDataPoint[];
  max?: number;
  color: string;
  padding?: Padding;
  style?: StyleProp<ViewStyle>;
}

const AreaChart = (props: AreaChartProps) => {
  const colorScheme = useColorScheme();
  const color = colorScheme === "light" ? Color.LightTerritory : Color.DarkTerritory;

  const max = Math.max(...props.data.map((datum) => datum.y));

  return (
    <Chart
      style={props.style}
      data={props.data}
      yDomain={{ min: 0, max: props.max || max }}
      disableTouch
      disableGestures
      padding={props.padding || { bottom: 5, top: 5 }}
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
      <Area
        smoothing="cubic-spline"
        theme={{
          gradient: {
            from: { color: props.color },
            to: { color: props.color, opacity: 0 },
          },
        }}
      />
      <Line
        smoothing="cubic-spline"
        theme={{
          stroke: { color: props.color, width: 3 },
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
    </Chart>
  );
};

export { AreaChart };
