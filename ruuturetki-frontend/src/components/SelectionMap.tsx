import L from 'leaflet'
import { MapContainer, TileLayer, } from 'react-leaflet'
import LocationPicker from './LocationPicker.tsx'
import { GameState } from '../types.ts'

function SelectionMap({
  gameState,
  setGameState
}: {
  gameState: GameState,
  setGameState: Function
}) {
  // Settings for selection map
  const zoneBounds: L.LatLngBounds = L.latLngBounds(L.latLng(60.13, 24.82), L.latLng(60.295, 25.20))
  const zoneCenter: L.LatLng = zoneBounds.getCenter()
  const pickerBounds: L.LatLngBounds = zoneCenter.toBounds(30000)
  const selectorMapOptions: L.MapOptions = {
    center: L.latLng(60.18, 24.95),
    zoom: 11,
    scrollWheelZoom: true,
    maxBounds: pickerBounds,
  }

  return (
    <MapContainer id="selector-map" {...selectorMapOptions}>
      <TileLayer
        attribution={'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
        url={'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'}
      />
      <LocationPicker
        gameState={gameState}
        setGameState={setGameState}
      />
    </MapContainer>
  )
}

export default SelectionMap