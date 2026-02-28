import { Modal } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { MapContainer, TileLayer } from "react-leaflet";
import { GameState } from "../../types/types.ts";
import L from "leaflet";
import { tileLayerOptions } from "../../utils/mapLayerHelpers.ts";
import { useState } from "react";
import GameSummary from "../GameSummary.tsx";
import MapMarkers from "../MapMarkers.tsx";

function RoundEndModal({
  gameState,
  show,
  handleCloseREM,
}: {
  gameState: GameState;
  show: boolean;
  handleCloseREM: () => void;
}) {
  const [summaryShown, setSummaryShown] = useState(false);

  const roundNumber = gameState.roundId + 1;
  const roundScore = gameState.score[gameState.roundId];
  const totalScore = gameState.score.reduce((a, c) => a + c, 0);
  const correctLocation = gameState.locations[gameState.roundId];
  const resultMapOptions: L.MapOptions = {
    center: correctLocation,
    zoom: 13,
  };
  const guessedLocation = gameState.guesses[gameState.roundId];
  const modalTitle = summaryShown
    ? "Game Summary"
    : `Round ${roundNumber} out of 5 score`;

  const handleClick = () => {
    // Show game summary on the last round and close REM on other rounds
    if (summaryShown || roundNumber < 5) {
      handleCloseREM();
    } else {
      setSummaryShown(true);
    }
  };

  // Round summary element is show after every round
  const roundSummary = (
    <>
      <h2>{roundScore} points for the round!</h2>
      {roundScore !== 0 && (
        <meter
          value={roundScore}
          max={10000}
          low={4000}
          high={8000}
          optimum={9000}
        />
      )}
      <MapContainer id="results-map" {...resultMapOptions}>
        <TileLayer {...tileLayerOptions()} />
        <MapMarkers
          locations={[correctLocation, guessedLocation]}
          tooltipTexts={["The correct location", "Your guess"]}
        />
      </MapContainer>
      <h2 id="modal-score">
        {totalScore} / {roundNumber}0 000 total points
      </h2>
      {totalScore !== 0 && (
        <meter
          value={totalScore}
          max={10000 * roundNumber}
          low={4000 * roundNumber}
          high={8000 * roundNumber}
          optimum={9000 * roundNumber}
        />
      )}
    </>
  );

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
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-content">
            {/* Round summary is the default content to show and game 
            summary is onyl shown after clicking next */}
            {summaryShown ? (
              <GameSummary gameState={gameState} />
            ) : (
              roundSummary
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClick}>
            {/* Text of the button */}
            {roundNumber < 5
              ? "Next"
              : summaryShown
                ? "End"
                : "Show game summary"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RoundEndModal;
