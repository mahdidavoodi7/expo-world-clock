import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClockContainer } from './components/Clock';


export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ClockContainer />
      </GestureHandlerRootView >
    </SafeAreaProvider>
  );
}
