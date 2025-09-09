import { CircleLayer, Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import { featureCollection, point } from '@turf/turf';
// import scooters from 'data/scooter.json';
import { useScooter } from '~/providers/ScooterProvider';

export default function ScooterMarkers() {
  const { setSelectedScooter, nearbyScooters }: any = useScooter();
  const points = nearbyScooters.map((scooter: any) => point([scooter.long, scooter.lat], { scooter }));
  const onPointPress = async (event: OnPressEvent) => {
    if (event.features[0].properties?.scooter) {
      setSelectedScooter(event.features[0].properties.scooter);
    }
  };

  return (
    <ShapeSource id="scooters" cluster shape={featureCollection(points)} onPress={onPointPress}>
      <SymbolLayer
        id="clusters-count"
        style={{
          textField: ['get', 'point_count'],
          textSize: 18,
          textPitchAlignment: 'map',
          textColor: '#ffffff',
        }}
      />

      <CircleLayer
        id="clusters"
        belowLayerID="clusters-count"
        filter={['has', 'point_count']}
        style={{
          circleColor: '#42E100',
          circleRadius: 20,
          circleOpacity: 1,
          circleStrokeWidth: 2,
          circleStrokeColor: 'white',
          circlePitchAlignment: 'map',
        }}
      />

      <SymbolLayer
        id="scooter-icons"
        filter={['!', ['has', 'point_count']]}
        style={{
          iconImage: 'pin',
          iconSize: 0.5,
          iconAllowOverlap: true,
          iconAnchor: 'bottom',
        }}
      />
      <Images images={{ pin: require('assets/pin.png') }} />
    </ShapeSource>
  );
}
