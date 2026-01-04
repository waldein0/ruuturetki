import { Modal } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import type { GameState } from '../Game'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import markerIcon from '../MarkerIcon.tsx'

function ModalButton({
  round,
  handleCloseREM
}: {
  round: number,
  handleCloseREM: () => void
}) {

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleCloseREM}
      >
        {(round < 5) ? 'Next' : 'End'}
      </Button>
    </>
  )
}

const ModalMap = ({ gameState }: { gameState: GameState }) => {
  const resultCenter: L.LatLng = gameState.locations[gameState.rounds - 1]
  const resultMapOptions: L.MapOptions = {
    center: resultCenter,
    zoom: 12,
    scrollWheelZoom: true,
  }
  console.log('REM gameState:', gameState)
  if (!gameState.picked) {
    return (
      <MapContainer id="results-map" {...resultMapOptions}>
        <TileLayer
          attribution={'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
          url={'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'}
        />
        <Marker position={gameState.locations[gameState.rounds - 1]} icon={markerIcon} >
          <Tooltip permanent>
            The correct answer (you didn't guess in time)
          </Tooltip>
        </Marker>
      </MapContainer>
    )
  }
  return (
    <MapContainer id="results-map" {...resultMapOptions}>
      <TileLayer
        attribution={'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
        url={'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'}
      />
      <Marker position={gameState.locations[gameState.rounds - 1]} icon={markerIcon}>
        <Tooltip permanent>
          The correct answer
        </Tooltip>
      </Marker>
      <Marker position={gameState.guesses[gameState.rounds - 1]} icon={markerIcon}>
        <Tooltip permanent>
          Your guess
        </Tooltip>
      </Marker>
    </MapContainer>
  )

}


function RoundEndModal({
  gameState,
  show,
  handleCloseREM,
  roundScore,
}: {
  gameState: GameState,
  show: boolean,
  handleCloseREM: () => void,
  roundScore: number
}) {

  return (
    <>
      <Modal
        show={show}
        onHide={handleCloseREM}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Round {gameState.rounds}/5 score:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-content">
            <h2>
              {roundScore} points for the round!
            </h2>
            <ModalMap gameState={gameState} />
            <h2 id="modal-score">
              {gameState.score} / {gameState.rounds}0 000 total points
            </h2>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ModalButton round={gameState.rounds} handleCloseREM={handleCloseREM} />
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default RoundEndModal