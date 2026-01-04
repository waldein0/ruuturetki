import L from 'leaflet'
import { MapContainer, TileLayer, } from 'react-leaflet'
import LocationPicker from './LocationPicker.tsx'
import { GameState } from '../types.ts'

function SelectionMap({
  // pickerPosition,
  // setPickerPosition,
  startPosition,
  setPickScore,
  gameState,
  setGameState
}: {
  // pickerPosition: L.LatLng | null,
  // setPickerPosition: Function,
  startPosition: L.LatLng
  setPickScore: Function,
  gameState: GameState,
  setGameState: Function
}) {

  const zone_bounds: L.LatLngBounds = L.latLngBounds(L.latLng(60.13, 24.82), L.latLng(60.295, 25.20))
  const zone_center: L.LatLng = zone_bounds.getCenter()
  const picker_bounds: L.LatLngBounds = zone_center.toBounds(30000)
  const selectorMapOptions: L.MapOptions = {
    center: L.latLng(60.18, 24.95),
    zoom: 11,
    scrollWheelZoom: true,
    maxBounds: picker_bounds,
  }

  return (
    <MapContainer id="selector-map" {...selectorMapOptions}>
      <TileLayer
        attribution={'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
        url={'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'}
      />
      <LocationPicker
        // pickerPosition={pickerPosition}
        // setPickerPosition={setPickerPosition}
        startPosition={startPosition}
        setPickScore={setPickScore}
        gameState={gameState}
        setGameState={setGameState}
      />
    </MapContainer>
  )
}

export default SelectionMap
