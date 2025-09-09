import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { useAuth } from "./AuthProvider";
import { Alert } from "react-native";
import * as Location from 'expo-location';
import { fetchDirectionBasedOnCoords } from "~/services/directions";




const RideContext = createContext({});

export default function RideProvider({ children }: PropsWithChildren) {

    const [ride, setRide] = useState(null);
    const [rideRoute, setRideRoute] = useState<number[][]>([])
    const { userId } = useAuth();

    useEffect(() => {
        console.log("userId in RideProvider:", userId);
        if (!userId) return;

        const fetchActiveRide = async () => {
            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('user_id', userId)
                .is('finished_at', null)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.log('Fetch active ride error:', error);
            } else {
                console.log('Fetch active ride data:', data);
            }

            setRide(data ?? null);
        };

        fetchActiveRide();
    }, [userId]);



    useEffect(() => {
        let subscription: Location.LocationSubscription | undefined;

        const watchLocation = async () => {
            subscription = await Location.watchPositionAsync({ distanceInterval: 1 }, (newLocation) => {
                console.log('New location: ', newLocation.coords.longitude, newLocation.coords.latitude);
                setRideRoute((currrRoute) => [
                    ...currrRoute,
                    [newLocation.coords.longitude, newLocation.coords.latitude],
                ]);
                // const from = point([newLocation.coords.longitude, newLocation.coords.latitude]);
                // const to = point([selectedScooter.long, selectedScooter.lat]);
                // const distance = getDistance(from, to, { units: 'meters' });
                // if (distance < 100) {
                //   setIsNearby(true);
                // }
            });
        };

        if (ride) {
            watchLocation();
        }

        // unsubscribe
        return () => {
            subscription?.remove();
        };
    }, [ride]);


    const finishRide = async () => {
        if (!ride) {
            Alert.alert('No active ride to finish');
            return;
        }
        const allSame = rideRoute.every(
            ([lon, lat]) => lon === rideRoute[0][0] && lat === rideRoute[0][1]
        );

        if (allSame) {
            Alert.alert('Sürüş rotası boyunca hareket tespit edilmedi.');
            return setRide(null);
        }
        try {
            const actualRoute = await fetchDirectionBasedOnCoords(rideRoute);
            console.log("actualRoute", actualRoute);

            const rideRouteCoords = actualRoute.matchings[0].geometry.coordinates;
            const rideRouteDuration = actualRoute.matchings[0].duration;
            const rideRouteDistance = actualRoute.matchings[0].distance;
            setRideRoute(rideRouteCoords);

            const { error } = await supabase
                .from('rides')
                .update({
                    finished_at: new Date(),
                    routeDuration: rideRouteDuration,
                    routeDistance: rideRouteDistance,
                    routeCoords: rideRouteCoords,
                })
                .eq('id', ride.id);


            // 2. Scooter'ın son konumunu güncelle (GeoJSON formatında)
            const lastCoord = rideRouteCoords[rideRouteCoords.length - 1]; // [longitude, latitude]
            const [long, lat] = lastCoord;

            const pointWKT = `POINT(${long} ${lat})`; // 📍WKT formatında

            const { error: scooterUpdateError } = await supabase
                .from('scooters')
                .update({
                    location: pointWKT, // 📌 Kolon adın 'location' değilse değiştir!
                })
                .eq('id', ride.scooter_id);

            if (scooterUpdateError) {
                console.error("Scooter konumu güncellenemedi:", scooterUpdateError);
            }

            if (error) {
                Alert.alert('Failed to finish the ride');
                console.log("Update error:", error);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('rides')
                .select('*')
                .eq('user_id', userId)
                .is('finished_at', null)
                .limit(1)
                .maybeSingle();

            if (fetchError) {
                console.log("Error fetching active ride after finish:", fetchError);
            }

            console.log("Ride after finishing:", data);
            setRide(data ?? null);
        } catch (e) {
            console.log("Unexpected error in finishRide:", e);
            Alert.alert("An unexpected error occurred");
        }
    }



    const startRide = async (scooterId: number) => {

        if (ride) {
            Alert.alert('Cannot start a new ride while another one is in progress')
            return;
        }

        const { data, error } = await supabase
            .from('rides')
            .insert([
                {
                    user_id: userId,
                    scooter_id: scooterId,
                },
            ])
            .select()
        if (error) {
            Alert.alert('Failed to start the ride')
            console.log(error)
        } else {
            setRide(data[0])
        }
    }

    return (

        <RideContext.Provider value={{ startRide, ride, finishRide, rideRoute }}>
            {children}
        </RideContext.Provider>
    )
}


export const useRide = () => useContext(RideContext)