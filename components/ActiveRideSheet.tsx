import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { Text } from "react-native";
import { useRide } from "~/providers/RideProvider";
import { Button } from "./Button";

export default function ActiveRideSheet() {
    const { ride, finishRide } = useRide()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const waitForLayout = () => new Promise((resolve) => setTimeout(resolve, 100));


    useEffect(() => {
        const maybeOpenBottomSheet = async () => {
            if (ride) {
                await waitForLayout(); 
                bottomSheetRef.current?.expand();
            }
        };

        maybeOpenBottomSheet();
    }, [ride]);


    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={[200]}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#414442' }}>
            {ride &&
                <BottomSheetView style={{ flex: 1, padding: 10, gap: 20 }} >
                    <Text style={{color:'white'}}>Ride in progress</Text>
                    <Button
                        title='Finish Journey'
                        onPress={async () => {
                            await finishRide();
                            bottomSheetRef.current?.close();
                        }}
                    />
                </BottomSheetView>
            }
        </BottomSheet>
    )
}