import { Button, Form } from "react-bootstrap";
import { DailyScore, FormEvent, GameState } from "../types/types";
import dailyScoreService from "../services/dailyScore";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import DailyScoresTable from "./DailyScoresTable";
import fetchDailyScores from "../utils/fetchDailyScores";

// const scoreExample: DailyScore[] = [
//   { date: "2026-02-02", playerName: "test1", score: 35020 },
//   { date: "2026-02-02", playerName: "test2", score: 22020 },
//   { date: "2026-02-02", playerName: "test3", score: 46020 },
//   { date: "2026-02-02", playerName: "test4", score: 16020 },
// ];

export default function GameSummary({ gameState }: { gameState: GameState }) {
  const totalScore = gameState.score.reduce((a, c) => a + c, 0);

  return (
    <div className="game-summary-content">
      <h4 className="fade-in">
        <b>You got</b>
      </h4>
      <div className="fade-in summary-points">
        <h2>{totalScore} / 50 000 points</h2>
        {totalScore !== 0 && (
          <meter
            value={totalScore}
            max={50000}
            low={20000}
            high={40000}
            optimum={50000}
          />
        )}
      </div>
      {/* Don't show round scores when a daily challenge is played 
      (it looks bad with scoreboard)*/}
      {!gameState.isChallenge && (
        <div className="fade-in summary-rounds">
          <table>
            <thead>
              <tr>
                <td>Round</td>
                <td>Score</td>
              </tr>
            </thead>
            <tbody>
              {gameState.score.map((score, index) => (
                <tr>
                  <td className="summary-round-id">{index + 1}</td>
                  <td>{score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Show scoreboard only when a daily challenge is played */}
      {gameState.isChallenge && <Scoreboard totalScore={totalScore} />}
    </div>
  );
}

function Scoreboard({ totalScore }: { totalScore: number }) {
  const today = dayjs();
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [isSent, setIsSent] = useState(false); // Boolean for disabling form after submit

  // Get scores for the scoreboard
  useEffect(() => {
    fetchDailyScores(today, setScores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nickname: string = form.nickname.value;

    // Send score to database
    const dailyScore: DailyScore = {
      date: today.format("YYYY-MM-DD"),
      playerName: nickname === "" ? "Anonymous player" : nickname,
      score: totalScore,
    };
    console.log("Sending daily challenge score:", dailyScore);
    dailyScoreService.create(dailyScore);

    // Reload scores after 1 second
    setTimeout(() => {
      fetchDailyScores(today, setScores);
    }, 1000);

    // Disable form
    setIsSent(true);
  };

  return (
    <div className="fade-in scoreboard">
      <DailyScoresTable dailyScores={scores} />
      {/* Show submit score form until it is sent */}
      {!isSent ? (
        <div className="scoreboard-form fade-in">
          <h4>
            <b>Submit your score to the daily challenge scoreboard</b>
          </h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nickname</Form.Label>
              <Form.Control
                id="nickname"
                type="text"
                placeholder="Enter nickname"
              />
            </Form.Group>
            <Button variant="secondary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      ) : (
        <p>Form submitted</p>
      )}
    </div>
  );
}
