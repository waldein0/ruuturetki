import { DailyChallenge } from "../types/types";
import { cityForMapLayer, decadeForMapLayer } from "../utils/mapLayerHelpers";

/**
 * Returns an info table of the provided daily challenge.
 */
export default function DailyChallengeInfoTable({
  challenge,
}: {
  challenge: DailyChallenge;
}) {
  const city = cityForMapLayer(challenge.maplayer);
  const decade = decadeForMapLayer(challenge.maplayer);

  return (
    <table>
      <tbody>
        <tr>
          <td className="header">
            <b>City:</b>
          </td>
          <td className="data-cell">
            <i>{city}</i>
          </td>
        </tr>
        <tr>
          <td className="header">
            <b>Decade:</b>
          </td>
          <td className="data-cell">
            <i>{decade}</i>
          </td>
        </tr>
        <tr>
          <td className="header">
            <b>Moving:</b>
          </td>
          <td className="data-cell">
            <i>{challenge.moving ? "Allowed" : "Disabled"}</i>
          </td>
        </tr>
        <tr>
          <td className="header">
            <b>Timer:</b>
          </td>
          <td className="data-cell">
            <i>{challenge.timed ? "15 seconds per round" : "No"}</i>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
