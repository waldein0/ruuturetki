import { useState, useEffect } from 'react'
import { getDistance } from 'geolib'
import { useMap } from 'react-leaflet'
import { GameState } from '../types'

function DevStats({
  startPosition,
  pickScore,
  distance,
  setDistance,
  gameState,
}: {
  startPosition: L.LatLng,
  pickScore: number,
  distance: number,
  setDistance: Function,
  gameState: GameState,
}) {
  const [devPosition, setDevPosition] = useState(startPosition)
  const map = useMap()
  useEffect(() => {
    setDevPosition(startPosition)
    setDistance(0)
  }, [startPosition])

  function distUpdate(newStartPosition: L.LatLng) {
    const maxDistance = getDistance(
      { latitude: startPosition.lat, longitude: startPosition.lng },
      { latitude: devPosition.lat, longitude: devPosition.lng },
    )
    if (maxDistance > distance) {
      setDistance(maxDistance)
    }
    setDevPosition(newStartPosition)
  }

  const onMove = () => {
    distUpdate(map.getCenter())
  }

  useEffect(() => {
    map.on('move', onMove)
    return () => {
      map.off('move', onMove)
    }
  }, [map, onMove])

  if (!gameState.user || (gameState.user && !gameState.user.admin)) {
    return null
  }

  return (
    <div id="dev-stat">
      <h2 >
        latitude: {devPosition.lat.toFixed(4)}, longitude: {devPosition.lng.toFixed(4)}{'  '}
        maximum distance: {distance}{'  '}
        pick score: {pickScore}{'  '}
      </h2>
      <h1>
        round: {gameState.rounds + 1}{'  '}
        score: {gameState.score}{'  '}
        picked(true=1): {Number(gameState.picked)}
      </h1>
    </div>
  )
}

export default DevStats