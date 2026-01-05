import { Modal } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import markerIcon from '../MarkerIcon.tsx'
import { GameState } from '../../types.ts'

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
  const resultCenter: L.LatLng = gameState.locations[gameState.roundId]
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
        <Marker position={gameState.locations[gameState.roundId]} icon={markerIcon} >
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
      <Marker position={gameState.locations[gameState.roundId]} icon={markerIcon}>
        <Tooltip permanent>
          The correct answer
        </Tooltip>
      </Marker>
      <Marker position={gameState.guesses[gameState.roundId]} icon={markerIcon}>
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
}: {
  gameState: GameState,
  show: boolean,
  handleCloseREM: () => void,
}) {
  let score = 0
  try {
    score = gameState.score[gameState.roundId]
  } catch (err) {
    /* This error happens only if the
    last round is skipped (REM shown without 
    calculating a score for the round).
    In all other cases assign correct round score */
   }
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
          <Modal.Title>Round {gameState.roundId + 1}/5 score:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-content">
            <h2>
              {gameState.score[gameState.roundId]} points for the round!
            </h2>
            <ModalMap gameState={gameState} />
            <h2 id="modal-score">
              {gameState.score.reduce((a, c) => a + c, 0)} / {gameState.roundId + 1}0 000 total points
            </h2>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ModalButton round={gameState.roundId} handleCloseREM={handleCloseREM} />
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default RoundEndModal