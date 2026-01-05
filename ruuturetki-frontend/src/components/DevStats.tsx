import { getDistance } from 'geolib'
import { GameState } from '../types'

function DevStats({ gameState }: { gameState: GameState }) {
  if (!gameState.user || (gameState.user && !gameState.user.admin)) {
    return null
  }
  // Get the state of the game
  const startPosition = gameState.locations[gameState.roundId]
  const distanceMoved = gameState.distanceMoved
  let pickScore = 0
  try {
    pickScore = getDistance({
      latitude: gameState.locations[gameState.roundId].lat,
      longitude: gameState.locations[gameState.roundId].lng
    }, {
      latitude: gameState.guesses[gameState.roundId].lat,
      longitude: gameState.guesses[gameState.roundId].lng
    })
  } catch (error) { /* Location not yet guessed, do nothing */ }

  return (
    <div id="dev-stat">
      <h2 >
        latitude: {startPosition.lat.toFixed(4)}, longitude: {startPosition.lng.toFixed(4)}{'  '}
        maximum distance: {distanceMoved}{'  '}
        pick score: {pickScore}{'  '}
      </h2>
      <h1>
        round: {gameState.roundId + 1}{'  '}
        round scores: {gameState.score.reduce((a, c) => a + `[${c}],`, ``)}{'  '}
        picked(true=1): {Number(gameState.picked)}
      </h1>
    </div>
  )
}

export default DevStats