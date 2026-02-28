import { DailyScore } from "../types/types";

export default function DailyScoresTable({
  dailyScores,
}: {
  dailyScores: DailyScore[];
}) {
  return (
    <>
      <h4>
        <b>Scoreboard</b>
      </h4>
      <table>
        <thead>
          <tr>
            <td>
              <b>Nickname</b>
            </td>
            <td>
              <b>Score</b>
            </td>
          </tr>
        </thead>
        <tbody>
          {dailyScores
            .sort((a, b) => b.score - a.score)
            .map((dailyScore) => (
              <tr>
                <td className="scoreboard">{dailyScore.playerName}</td>
                <td>{dailyScore.score}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
