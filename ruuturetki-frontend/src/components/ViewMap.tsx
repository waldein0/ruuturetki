import { MapContainer, WMSTileLayer, Marker, Popup } from 'react-leaflet'
import MapComponents from './MapComponents.tsx'
import { useState, useEffect } from 'react'
import { GameSettings, GameState } from '../types.ts'
import markerIcon from './MarkerIcon.tsx'

function OrtoLayer({
  map,
  startPosition,
  renderKey
}: {
  map: string,
  startPosition: L.LatLng,
  renderKey: number,
}) {
  const bounds = startPosition.toBounds(4000)
  const wmsOptions: L.WMSOptions = {
    version: '1.1.1.1',
    layers: map,
    format: 'image/png',
    transparent: false,
    bounds: bounds,
  }

  return (
    <WMSTileLayer
      key={renderKey}
      url="https://kartta.hel.fi/ws/geoserver/avoindata/wms?"
      attribution={'&copy; <a href=https://hri.fi/data/fi/dataset/helsingin-ortoilmakuvat target="_blank">Helsingin kaupunki, kaupunkimittauspalvelut 2025</a>'}
      {...wmsOptions}
    />
  )
}

function ViewMap({
  gameState,
  setGameState,
  gameSettings
}: {
  gameState: GameState,
  setGameState: Function,
  gameSettings: GameSettings
}) {
  // Get the starting position of each round from gameState
  const startPosition = gameState.locations[gameState.roundId]

  // Set view map options
  const maxBounds: L.LatLngBounds = startPosition.toBounds(3800)
  const mapOptions: L.MapOptions = {
    center: startPosition,
    zoom: 17,
    scrollWheelZoom: false,
    maxBounds: maxBounds,
    maxBoundsViscosity: 0.9,
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: gameSettings.dragging
  }

  //key trick for forcing rerender on the WMS layer
  const [renderKey, setKey] = useState(1)
  useEffect(() => {
    setKey(prevKey => prevKey + 1)
  }, [startPosition])

  return (
    <>
      <MapContainer id="map" {...mapOptions} key={renderKey}>
        <OrtoLayer map={gameSettings.map} startPosition={startPosition} renderKey={renderKey} />
        <Marker position={startPosition} icon={markerIcon}>
          <Popup>
            Try to match this position!
          </Popup>
        </Marker>

        <MapComponents
          gameState={gameState}
          setGameState={setGameState}
          gameSettings={gameSettings}
        />
      </MapContainer>
    </>
  )
}

export default ViewMap