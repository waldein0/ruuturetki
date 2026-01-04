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
  rounds: 0,
  locations: [],
  guesses: [],
  score: 0,
  picked: false,
  skipped: 0,
  user: null
}

function Game({ gameSettings }: { gameSettings: GameSettings }) {
  const [startPosition, setStartPosition] = useState<L.LatLng>(() => getRandomLatLng())
  const [pickScore, setPickScore] = useState(0)
  const [gameState, setGameState] = useState(startState)
  const [distance, setDistance] = useState(0)

  return (
    <>
      <SelectionMap
        startPosition={startPosition}
        setPickScore={setPickScore}
        gameState={gameState}
        setGameState={setGameState}
      />
      <ViewMap
        startPosition={startPosition}
        setStartPosition={setStartPosition}
        pickScore={pickScore}
        setPickScore={setPickScore}
        distance={distance}
        setDistance={setDistance}
        gameState={gameState}
        setGameState={setGameState}
        getRandomLatLng={getRandomLatLng}
        gameSettings={gameSettings}
      />
    </>
  )
}

export default Game