import MapBox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { useScooter } from '~/providers/ScooterProvider';
import LineRoute from './LineRoute';
import ScooterMarkers from './ScooterMarkers';
import { useRide } from '~/providers/RideProvider';

MapBox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function Map() {
  const { directionCoordinates }: any = useScooter();
  const { ride, rideRoute } = useRide()

  const showMarkers = !ride;

  return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera followUserLocation={true} followZoomLevel={15} />
      <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

      {rideRoute.length >= 2 && <LineRoute id="rideRoute" coordinates={rideRoute} />}

      {showMarkers && (
        <>
          <ScooterMarkers />
          {directionCoordinates && <LineRoute coordinates={directionCoordinates} />}
        </>
      )}



      
    </MapView>
  );
}
