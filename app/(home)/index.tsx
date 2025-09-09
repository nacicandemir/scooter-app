import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ActiveRideSheet from '~/components/ActiveRideSheet';
import Map from '~/components/Map';
import SelectedScooterSheet from '~/components/SelectedScooterSheet';
import { supabase } from '~/lib/supabase';


export default function Home() {

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      <Map />
      {/* <Button title='Sign out' onPress={() => supabase.auth.signOut()} /> */}
      <SelectedScooterSheet />
      <ActiveRideSheet />

    </>
  );
}
