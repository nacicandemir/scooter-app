import { Stack } from 'expo-router';
import ScooterProvider from '~/providers/ScooterProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AuthProvider from '~/providers/AuthProvider';
import RideProvider from '~/providers/RideProvider';
import { StatusBar } from 'expo-status-bar';


export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} >
      <AuthProvider>
        <RideProvider>
          <ScooterProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="light" />
          </ScooterProvider>
        </RideProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
