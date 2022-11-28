import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SafeAreaRefreshControl = (props) => {
  const { refreshing, onRefresh } = props;

  const insets = useSafeAreaInsets();

  return (
    <RefreshControl
      progressViewOffset={insets.top}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default SafeAreaRefreshControl;
