import { Button, Modal } from "react-bootstrap";
import { DailyChallenge, GameSettings } from "../../types/types";
import { useNavigate } from "react-router-dom";
import DailyChallengeInfoTable from "../DailyChallengeInfoTable";

/**
 * Modal for viewing daily challenge info and starting the daily challenge game.
 */
export default function DailyChallengeModal({
  show,
  handleCloseDailyChallenge,
  challenge,
  setGameSettings,
}: {
  show: boolean;
  handleCloseDailyChallenge: () => void;
  challenge: DailyChallenge;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}) {
  const navigate = useNavigate();

  // Prepares game settings for the challenge and starts the game
  const handleClickPlay = () => {
    setGameSettings({
      ortolayer: challenge.maplayer,
      dragging: challenge.moving,
      timed: challenge.timed,
    });
    navigate("/game");
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleCloseDailyChallenge}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Daily Challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body className="daily-challenge-modal">
          <DailyChallengeInfoTable challenge={challenge} />
          <Button variant="secondary" onClick={handleClickPlay}>
            Play Daily challenge
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}
