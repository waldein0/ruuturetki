import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from 'react-bootstrap'
import { useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import DevStats from './DevStats.tsx'
import RoundEndModal from './modals/RoundEndModal.tsx'
import { useNavigate } from 'react-router-dom'
import gameService from '../services/games'
import { GameSettings, GameState } from '../types.tsx'

function Timer({
  timer,
  setTimer
}: {
  timer: false | number,
  setTimer: Function
}) {
  // Render timer component only if timed mode is selected.
  if (timer === false) { return null }
  // Minus 1 from the timer every 1000 ms
  if (timer !== 0) { setTimeout(() => { setTimer(timer - 1) }, 1000) }
  // Return timer indicator
  return (
    <Button
      variant="dark"
      id="timer-indicator"
      disabled
    >
      {timer.toString()}
    </Button>
  )
}

function SelectButton({
  handleEndRound,
  timed
}: {
  handleEndRound: Function,
  timed: false | number
}) {
  // Do not render select button if timed mode is selected.
  if (timed) { return null }
  return (
    <>
      <Button
        id="select-button"
        variant="dark"
        onClick={() => handleEndRound()}
      >
        Select
      </Button>
    </>
  )
}

function SkipButton({ handleSkipMap }: { handleSkipMap: Function }) {
  return (
    <>
      <Button
        id="select-button"
        variant="dark"
        onClick={() => handleSkipMap()}
      >
        Skip
      </Button>
    </>
  )
}

function ResButton({ handleResetMap }: { handleResetMap: Function }) {
  return (
    <>
      <Button
        id="reset-button"
        variant="dark"
        onClick={() => handleResetMap()}
      >
        Reset map
      </Button>
    </>
  )
}

function MapComponents({
  startPosition,
  setStartPosition,
  pickScore,
  setPickScore,
  distance,
  setDistance,
  gameState,
  setGameState,
  getRandomLatLng,
  gameSettings
}: {
  startPosition: L.LatLng,
  setStartPosition: Function,
  pickScore: number,
  setPickScore: Function,
  distance: number,
  setDistance: Function,
  gameState: GameState,
  setGameState: Function,
  getRandomLatLng: Function,
  gameSettings: GameSettings
}) {
  const map = useMap()
  const [showREM, setShowREM] = useState(false)
  const [roundScore, setRoundScore] = useState(0)
  const [timer, setTimer] = useState(gameSettings.timed)
  const navigate = useNavigate()

  const handleCloseREM = () => {
    if (gameState.rounds < 5) {
      setShowREM(false)
      setGameState({ ...gameState, picked: false })
      refreshMap()
    } else {
      if (gameState.user && gameState.score > 0) {
        try {
          gameService.create({
            rounds: gameState.rounds - gameState.skipped,
            score: gameState.score,
            year: gameSettings.year
          })
        } catch (error) {
          console.log("Something went wrong with adding game", error)
        }
      }
      setShowREM(false)
      navigate("/")
    }
  }

  const handleShowREM = () => setShowREM(true)

  const handleEndRound = () => {
    // console.log('handleEndRound() called. GameState:', gameState)
    if (gameState.rounds > 5) { return null }

    let score = 0
    if (gameState.picked === false) {
      if (!gameSettings.timed) {
        /* Normal mode */

        // Implement here notification to the user to make a guess
        console.log(
          'Select clicked without setting a guess of the location.',
          'Try again after making a guess.'
        )
        // Give the user chance to make a guess
        // by stopping handleEndRound()
        return null
      } else {
        /* Timed mode */

        // Implement here notification to the user to be faster
        console.log(
          'Time run out before you made a guess of the location.',
          'Try being faster on the next round!'
        )
        // Score is set to 0 in the timed mode
        score = 0
        setRoundScore(score)
        const newState = {
          ...gameState,
          rounds: gameState.rounds + 1,
          locations: gameState.locations.concat(startPosition),
          guesses: gameState.guesses.concat(L.latLng(0, 0)),
          score: gameState.score + score,
        }
        setGameState(newState)
        handleShowREM()
      }
    } else {
      /* Both modes and a location guessed*/

      // Calculate the score of the guess
      score = Math.max((10000 - pickScore * 2 - distance * 2.5), 0)

      setRoundScore(score)
      const newState = {
        ...gameState,
        rounds: gameState.rounds + 1,
        locations: gameState.locations.concat(startPosition),
        score: gameState.score + score,
      }
      setGameState(newState)
      handleShowREM()
    }
  }

  const handleSkipMap = async () => {
    // Different handling if it is the last round
    const newState = {
      ...gameState,
      rounds: gameState.rounds + 1,
      locations: gameState.locations.concat(startPosition),
      guesses: gameState.guesses.concat(L.latLng(0, 0)),
      picked: false,
      skipped: gameState.skipped + 1,
    }

    if (gameState.rounds === 4) {
      await setGameState(newState)
      setShowREM(true)
    } else {
      // Other than the last round
      setGameState(newState)
      refreshMap()
    }
  }

  const handleResetMap = () => {
    map.setView(startPosition)
  }

  const refreshMap = () => {
    const newStartPosition: L.LatLng = getRandomLatLng()
    setStartPosition(newStartPosition)
    setRoundScore(0)
    setPickScore(0)
    map.setView(newStartPosition)
  }

  // Monitor timer and handle timer reaches 0
  useEffect(() => {
    if (timer === 0) {
      handleEndRound()
    }
  }, [timer])

  return (
    <>
      <Button
        variant="dark"
        disabled
        id="round-indicator"
      >
        {(gameState.rounds < 5) ? gameState.rounds + 1 : 5}/5
      </Button>
      <Timer
        timer={timer}
        setTimer={setTimer}
      />
      <RoundEndModal
        gameState={gameState}
        show={showREM}
        handleCloseREM={handleCloseREM}
        roundScore={roundScore}
      />
      <div id="controls">
        <ResButton handleResetMap={handleResetMap} />
        <SelectButton
          handleEndRound={handleEndRound}
          timed={gameSettings.timed}
        />
        <SkipButton handleSkipMap={handleSkipMap} />
        <Button
          id="home-button"
          variant="dark"
          onClick={() => navigate('/')}
        >
          Exit
        </Button>
      </div>
      <DevStats
        startPosition={startPosition}
        pickScore={pickScore}
        distance={distance}
        setDistance={setDistance}
        gameState={gameState}
      />
    </>
  )
}

export default MapComponents