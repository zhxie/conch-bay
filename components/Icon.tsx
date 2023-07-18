import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart2,
  BellDot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Crown,
  Download,
  Filter,
  HelpCircle,
  Info,
  LifeBuoy,
  Minus,
  PartyPopper,
  RefreshCw,
  TrendingUp,
  Upload,
  X,
  XCircle,
} from "lucide-react-native";

type IconName =
  | "circle"
  | "minus"
  | "x"
  | "x-circle"
  | "arrow-up"
  | "arrow-right"
  | "arrow-down"
  | "info"
  | "alert-circle"
  | "download"
  | "upload"
  | "help-circle"
  | "life-buoy"
  | "bell-dot"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "crown"
  | "party-popper"
  | "filter"
  | "bar-chart-2"
  | "trending-up"
  | "refresh-cw";

interface IconProps {
  name: IconName;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}

const Icon = (props: IconProps) => {
  switch (props.name) {
    case "circle":
      return <Circle size={props.size} color={props.color} style={props.style} />;
    case "minus":
      return <Minus size={props.size} color={props.color} style={props.style} />;
    case "x":
      return <X size={props.size} color={props.color} style={props.style} />;
    case "x-circle":
      return <XCircle size={props.size} color={props.color} style={props.style} />;
    case "arrow-up":
      return <ArrowUp size={props.size} color={props.color} style={props.style} />;
    case "arrow-right":
      return <ArrowRight size={props.size} color={props.color} style={props.style} />;
    case "arrow-down":
      return <ArrowDown size={props.size} color={props.color} style={props.style} />;
    case "info":
      return <Info size={props.size} color={props.color} style={props.style} />;
    case "alert-circle":
      return <AlertCircle size={props.size} color={props.color} style={props.style} />;
    case "download":
      return <Download size={props.size} color={props.color} style={props.style} />;
    case "upload":
      return <Upload size={props.size} color={props.color} style={props.style} />;
    case "help-circle":
      return <HelpCircle size={props.size} color={props.color} style={props.style} />;
    case "life-buoy":
      return <LifeBuoy size={props.size} color={props.color} style={props.style} />;
    case "bell-dot":
      return <BellDot size={props.size} color={props.color} style={props.style} />;
    case "chevron-left":
      return <ChevronLeft size={props.size} color={props.color} style={props.style} />;
    case "chevron-right":
      return <ChevronRight size={props.size} color={props.color} style={props.style} />;
    case "chevron-down":
      return <ChevronDown size={props.size} color={props.color} style={props.style} />;
    case "crown":
      return <Crown size={props.size} color={props.color} style={props.style} />;
    case "party-popper":
      return <PartyPopper size={props.size} color={props.color} style={props.style} />;
    case "filter":
      return <Filter size={props.size} color={props.color} style={props.style} />;
    case "bar-chart-2":
      return <BarChart2 size={props.size} color={props.color} style={props.style} />;
    case "trending-up":
      return <TrendingUp size={props.size} color={props.color} style={props.style} />;
    case "refresh-cw":
      return <RefreshCw size={props.size} color={props.color} style={props.style} />;
  }
};

export { IconName };
export default Icon;
