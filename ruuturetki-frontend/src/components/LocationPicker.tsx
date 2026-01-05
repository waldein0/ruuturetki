import L from 'leaflet'
import { useMapEvents, useMap, Marker } from 'react-leaflet'
import { useEffect, useState } from 'react'
import markerIcon from './MarkerIcon.tsx'
import { GameState } from '../types.ts'

function LocationPicker({
  gameState,
  setGameState
}: {
  gameState: GameState,
  setGameState: Function
}) {
  // Marker for the guessed location
  const [marker, setMarker] = useState<null | L.LatLng>(null)

  // Get the starting position of each round from gameState
  const startPosition = gameState.locations[gameState.roundId]

  // Center the selection map when a round starts
  const mapInstance = useMap()
  useEffect(() => {
    mapInstance.setView(L.latLng(60.18, 24.95), 11)
    setMarker(null)
  }, [startPosition])

  // Listen to selection map events (location guesses and hover)
  const map = useMapEvents({
    // Location guesses
    click: (e) => {
      // Get guessed location
      const guessedLocation = e.latlng
      console.log('Clicked a position on SelectionMap:', guessedLocation)

      // Get previous round guesses 
      const oldGuesses = gameState.guesses.slice(0, gameState.roundId)

      // Set or (if already set) reset the guess to the gameState
      setGameState({
        ...gameState,
        picked: true,
        guesses: oldGuesses.concat(guessedLocation)
      })

      // Show marker of the guess on the selection map
      setMarker(guessedLocation)
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