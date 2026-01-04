import { useState, useEffect } from 'react'
import L from 'leaflet'
import SelectionMap from './SelectionMap.tsx'
import ViewMap from './ViewMap.tsx'
import { getDistance } from 'geolib'
import gameService from '../services/games'
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
  // const [pickerPosition, setPickerPosition] = useState<L.LatLng | null>(null)
  const [pickScore, setPickScore] = useState(0)
  const [gameState, setGameState] = useState(startState)
  const [distance, setDistance] = useState(0)
  // console.log('game run')

  // // Calculate score for a guess and update game state 
  // useEffect(() => {
  //   if (pickerPosition) {
  //     const score = getDistance(
  //       { latitude: startPosition.lat, longitude: startPosition.lng },
  //       { latitude: pickerPosition.lat, longitude: pickerPosition.lng },
  //     )
  //     setPickScore(score)
  //   }
  //   // Update picked state 
  //   if (pickerPosition && gameState.picked === false) {
  //     setGameState({ ...gameState, picked: true })
  //   }
  // }, [pickerPosition])

  // useEffect(() => {
  //   const gameUserJSON = window.localStorage.getItem('gameUser')
  //   if (gameUserJSON) {
  //     const user = JSON.parse(gameUserJSON)
  //     setGameState({ ...gameState, user: user })
  //     gameService.setToken(user.token)
  //   } else {
  //     gameService.setToken('')
  //     setGameState({ ...gameState, user: null })
  //   }
  // }, [])

  return (
    <>
      <SelectionMap
        // pickerPosition={pickerPosition}
        // setPickerPosition={// setPickerPosition}
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
        // pickerPosition={pickerPosition}
        getRandomLatLng={getRandomLatLng}
        gameSettings={gameSettings}
      />
    </>
  )
}

export default Game
export type { GameState }