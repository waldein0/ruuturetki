import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "react-bootstrap";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import DevStats from "./DevStats.tsx";
import RoundEndModal from "./modals/RoundEndModal.tsx";
import { useNavigate } from "react-router-dom";
import { GameSettings, GameState } from "../types/types.ts";
import { getDistance } from "geolib";

function Timer({
  timer,
  setTimer,
}: {
  timer: false | number;
  setTimer: React.Dispatch<React.SetStateAction<number | false>>;
}) {
  // Render timer component only if timed mode is selected.
  if (timer === false) {
    return null;
  }
  // Minus 1 from the timer every 1000 ms
  if (timer !== 0) {
    setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);
  }
  // Return timer indicator
  return (
    <Button variant="dark" id="timer-indicator" disabled>
      {timer.toString()}
    </Button>
  );
}

function SelectButton({
  handleEndRound,
  timed,
}: {
  handleEndRound: () => void;
  timed: false | number;
}) {
  // Do not render select button if timed mode is selected.
  if (timed) {
    return null;
  }
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
  );
}

function SkipButton({ handleSkipMap }: { handleSkipMap: () => void }) {
  return (
    <>
      <Button id="select-button" variant="dark" onClick={() => handleSkipMap()}>
        Skip
      </Button>
    </>
  );
}

function ResButton({ handleResetMap }: { handleResetMap: () => void }) {
  return (
    <>
      <Button id="reset-button" variant="dark" onClick={() => handleResetMap()}>
        Reset map
      </Button>
    </>
  );
}

function MapComponents({
  gameState,
  setGameState,
  gameSettings,
}: {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameSettings: GameSettings;
}) {
  const map = useMap();
  const [showREM, setShowREM] = useState(false);
  const [timer, setTimer] = useState(gameSettings.timed);
  const navigate = useNavigate();

  // Add Leaflet map API to window for getting map states in tests
  useEffect(() => {
    window.viewMap = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Monitor timer and handle timer reaches 0
  useEffect(() => {
    if (timer === 0) {
      handleEndRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  // Calculate the max distance the user has moved from the
  // starting location during a round
  // and set it to gameState.distanceMoved (affects the round score!)
  function onMove() {
    const distanceMoved = getDistance(
      {
        latitude: gameState.locations[gameState.roundId].lat,
        longitude: gameState.locations[gameState.roundId].lng,
      },
      {
        latitude: map.getCenter().lat,
        longitude: map.getCenter().lng,
      },
    );

    if (distanceMoved > gameState.distanceMoved) {
      setGameState({
        ...gameState,
        distanceMoved: distanceMoved,
      });
    }
  }
  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const handleCloseREM = () => {
    if (gameState.roundId < 4) {
      // Start a new round
      setShowREM(false);
      handleStartRound();
    } else {
      // End the game
      setShowREM(false);
      navigate("/");
    }
  };

  const handleShowREM = () => setShowREM(true);

  const handleStartRound = () => {
    // console.log('handleStartRound() called. Old gameState:', gameState)
    // Change gameState for the next round
    const newRoundGameState = {
      ...gameState,
      roundId: gameState.roundId + 1,
      distanceMoved: 0,
      picked: false,
    };
    // console.log('new gamestate:', newRoundGameState)
    // Center the viewMap to the new starting location and update gameState
    map.setView(gameState.locations[gameState.roundId + 1]);
    setGameState(newRoundGameState);
  };

  const handleEndRound = () => {
    // console.log('handleEndRound() called. GameState:', gameState)
    // Go through all different scenarios:
    // 1. Normal mode location not guessed
    // 2. Timed mode location not guessed
    // 3. Both modes location guessed
    if (gameState.picked === false) {
      if (!gameSettings.timed) {
        /* Normal mode */
        // Implement here notification to the user to make a guess
        console.log(
          "Select clicked without setting a guess of the location.",
          "Try again after making a guess.",
        );
        // Give the user chance to make a guess
        // by returning to the round
      } else {
        /* Timed mode */
        // Implement here notification to the user to be faster
        console.log(
          "Time run out before you made a guess of the location.",
          "Try being faster on the next round!",
        );
        // Score is set to 0 in the timed mode
        const score = 0;
        const emptyGuess = L.latLng(0, 0);
        // Set round end calculations to the gameState
        const roundEndState = {
          ...gameState,
          guesses: gameState.guesses.concat(emptyGuess),
          score: gameState.score.concat(score),
        };
        setGameState(roundEndState);
        // Continue to Round End Module
        handleShowREM();
      }
    } else {
      /* Both modes and a location guessed*/
      // Calculate the score of the guess
      const pickScore = getDistance(
        {
          latitude: gameState.locations[gameState.roundId].lat,
          longitude: gameState.locations[gameState.roundId].lng,
        },
        {
          latitude: gameState.guesses[gameState.roundId].lat,
          longitude: gameState.guesses[gameState.roundId].lng,
        },
      );
      const distanceMoved = gameState.distanceMoved;
      const score = Math.max(10000 - pickScore * 2 - distanceMoved * 2.5, 0);
      // Set round end calculations to the gameState
      const roundEndState = {
        ...gameState,
        score: gameState.score.concat(score),
      };
      setGameState(roundEndState);
      // Continue to Round End Module
      handleShowREM();
    }
  };

  const handleSkipMap = () => {
    // Continue to Round End Module if it is the last round.
    // Else continue to a new round
    if (gameState.roundId === 4) {
      const newState = {
        ...gameState,
        score: gameState.score.concat(0),
      };

      setGameState(newState);
      setShowREM(true);
    } else {
      // Prepare a new state for the next round
      const newState = {
        ...gameState,
        roundId: gameState.roundId + 1,
        guesses: gameState.guesses
          .slice(0, gameState.roundId)
          .concat(L.latLng(0, 0)),
        score: gameState.score.concat(0),
        distanceMoved: 0,
        picked: false,
        skipped: gameState.skipped + 1,
      };
      // console.log('skip newstate:', newState)
      /* Skip is broken. GameState is set correctly,
      but the changes are not updated to the map view and map components. */
      map.setView(gameState.locations[gameState.roundId + 1]);
      setGameState(newState);
    }
  };

  const handleResetMap = () => {
    map.setView(gameState.locations[gameState.roundId]);
  };

  return (
    <>
      <Button variant="dark" disabled id="round-indicator">
        {gameState.roundId < 5 ? gameState.roundId + 1 : 5}/5
      </Button>
      <Timer timer={timer} setTimer={setTimer} />
      <RoundEndModal
        gameState={gameState}
        show={showREM}
        handleCloseREM={handleCloseREM}
      />
      <div id="controls">
        <ResButton handleResetMap={handleResetMap} />
        <SelectButton
          handleEndRound={handleEndRound}
          timed={gameSettings.timed}
        />
        <SkipButton handleSkipMap={handleSkipMap} />
        <Button id="home-button" variant="dark" onClick={() => navigate("/")}>
          Exit
        </Button>
      </div>
      <DevStats gameState={gameState} />
    </>
  );
}

export default MapComponents;
