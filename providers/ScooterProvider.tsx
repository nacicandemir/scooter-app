import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getDirections } from '~/services/directions';
import { distance as getDistance, point } from '@turf/turf';
import { supabase } from '~/lib/supabase';
import { Alert } from 'react-native';
import { useRide } from './RideProvider';

const ScooterContext = createContext({});

export default function ScooterProvider({ children }: PropsWithChildren) {
  const [nearbyScooters, setNearbyScooters] = useState([])
  const [selectedScooter, setSelectedScooter]: any = useState();
  const [direction, setDirection] = useState();
  const [isNearby, setIsNearby] = useState(false);
  const { ride }:any = useRide();



  useEffect(() => {
    const fetchScooters = async () => {
      const location = await Location.getCurrentPositionAsync();
      const { error, data } = await supabase.rpc('nearby_scooters', {
        lat: location.coords.latitude,
        long: location.coords.longitude,
        max_dist_meters: 1000,
      });
      if (error) {
        console.error('Error fetching scooters:', error.message);
        Alert.alert('Failed to fetch scooters', error.message);
      } else {
        setNearbyScooters(data)
      }
    }

    fetchScooters()
  }, [ride])

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    const watchLocation = async () => {
      subscription = await Location.watchPositionAsync({ distanceInterval: 10 }, (newLocation) => {
        const from = point([newLocation.coords.longitude, newLocation.coords.latitude]);
        const to = point([selectedScooter.long, selectedScooter.lat]);
        const distance = getDistance(from, to, { units: 'meters' });

        setIsNearby(distance < 750); // her zaman çalışır — hem true hem false verir

      });
    };

    if (selectedScooter) {
      watchLocation();
    }

    // unsubscribe
    return () => {
      subscription?.remove();
    };
  }, [selectedScooter]);

  useEffect(() => {
    const fetchDirections = async () => {
      const myLocation = await Location.getCurrentPositionAsync();

      const newDirection = await getDirections(
        [myLocation.coords.longitude, myLocation.coords.latitude],
        [selectedScooter.long, selectedScooter.lat]
      );
      setDirection(newDirection);
    };
    if (selectedScooter) {
      fetchDirections();
      setIsNearby(false)
    } else {
      setDirection(undefined)
      setIsNearby(false)
    }
  }, [selectedScooter]);

  return (
    <ScooterContext.Provider
      value={{
        selectedScooter,
        setSelectedScooter,
        direction,
        directionCoordinates: direction?.routes?.[0]?.geometry?.coordinates,
        duration: direction?.routes?.[0]?.duration,
        distance: direction?.routes?.[0]?.distance,
        isNearby,
        nearbyScooters
      }}>
      {children}
    </ScooterContext.Provider>
  );
}

export const useScooter = () => useContext(ScooterContext);
