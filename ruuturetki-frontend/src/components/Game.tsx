import { useState } from 'react'
import L from 'leaflet'
import SelectionMap from './SelectionMap.tsx'
import ViewMap from './ViewMap.tsx'
import { GameState, GameSettings } from '../types'

export function getRandomLatLng() {
  const southBoundLat: number = 60.19
  const northBoundLat: number = 60.29
  const eastBoundLon: number = 25.20
  const westBoundLon: number = 24.825
  const randomLat: number = Math.random() * (northBoundLat - southBoundLat) + southBoundLat
  const randomLon: number = Math.random() * (eastBoundLon - westBoundLon) + westBoundLon
  return (L.latLng(randomLat, randomLon))
}

const startState: GameState = {
  roundId: 0,
  locations: [getRandomLatLng()],
  guesses: [],
  score: [],
  distanceMoved: 0,
  picked: false,
  skipped: 0,
  user: null
}

function Game({ gameSettings }: { gameSettings: GameSettings }) {
  const [gameState, setGameState] = useState(startState)

  return (
    <>
      <SelectionMap
        gameState={gameState}
        setGameState={setGameState}
      />
      <ViewMap
        gameState={gameState}
        setGameState={setGameState}
        gameSettings={gameSettings}
      />
    </>
  )
}

export default Game