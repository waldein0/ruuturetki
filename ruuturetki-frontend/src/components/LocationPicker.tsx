import L from 'leaflet'
import { useMapEvents, useMap, Marker } from 'react-leaflet'
import { getDistance } from 'geolib'
import { useEffect, useState } from 'react'
import markerIcon from './MarkerIcon.tsx'
import { GameState } from '../types.ts'

function LocationPicker({
  startPosition,
  setPickScore,
  gameState,
  setGameState
}: {
  startPosition: L.LatLng
  setPickScore: Function,
  gameState: GameState,
  setGameState: Function
}) {
  // Marker for the guessed location
  const [marker, setMarker] = useState<null | L.LatLng>(null)

  // Center the selection map when a round starts
  const mapInstance = useMap()
  useEffect(() => {
    // setPickerPosition(null)
    mapInstance.setView(L.latLng(60.18, 24.95), 11)
    setMarker(null)
  }, [startPosition])

  // Listen to selection map events (location guesses and hover)
  const map = useMapEvents({
    // Location guess
    click: (e) => {
      // Get guessed location
      const guessedLocation = e.latlng

      console.log('Clicked a position on SelectionMap:', guessedLocation)
      
      // Calculate score for the guess
      const score = getDistance(
        { latitude: startPosition.lat, longitude: startPosition.lng },
        { latitude: guessedLocation.lat, longitude: guessedLocation.lng },
      )
      // Set score to state
      setPickScore(score)

      // Show marker of the guess on the selection map
      setMarker(guessedLocation)

      // Get previous round guesses 
      const oldGuesses = gameState.guesses.slice(0, gameState.rounds)

      // Set or (if already set) reset the guess to the gameState
      setGameState({
        ...gameState,
        picked: true,
        guesses: oldGuesses.concat(guessedLocation)
      })      
    },

    // Switch to larger or smaller selection map 
    mouseover: () => {
      map.invalidateSize()
    },
    mouseout: () => {
      map.invalidateSize()
    }
  })

  return marker
    ? <Marker position={marker} icon={markerIcon} />
    : null
}

export default LocationPicker