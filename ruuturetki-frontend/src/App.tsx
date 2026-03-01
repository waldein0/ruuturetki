import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, WMSTileLayer } from "react-leaflet";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import "./App.css";
import Game from "./components/Game";
import { DailyChallenge, GameSettings, MapLayerName } from "./types/types";
import PlayModal from "./components/modals/PlayModal";
import Practice from "./components/Practice";
import L from "leaflet";
import getRandomLatLng from "./utils/getRandomLatLng";
import HelpModal from "./components/modals/HelpModal";
import Calendar from "./components/modals/Calendar";
import { wmsOptionsForMapLayer } from "./utils/mapLayerHelpers";
import calendarservice from "./services/dailyChallenge";
import dayjs from "dayjs";
import DailyChallengeModal from "./components/modals/DailyChallengeModal";

function StartMenu({
  setGameSettings,
  gameSettings,
  challenge,
  setChallenge,
}: {
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  gameSettings: GameSettings;
  challenge: DailyChallenge | undefined;
  setChallenge: React.Dispatch<
    React.SetStateAction<DailyChallenge | undefined>
  >;
}) {
  const [showPlayModal, setPlayModal] = useState(false);
  const [showHelpModal, setHelpModal] = useState(false);
  const [showCalendarModal, setCalendarModal] = useState(false);
  const [showDailyChallengeModal, setDailyChallengeModal] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const navigate = useNavigate();

  // Keep backend alive by pinging it every 14 minutes
  useEffect(() => {
    // Load daily challenges
    fetchDailies();
    async function pingBackend() {
      try {
        const ping = await calendarservice.getById("123456789");
        console.log("Backend ping:", ping);
      } catch (error) {
        console.log("Cannot ping backend!", error);
      }
    }
    const fetch_id = setInterval(pingBackend, 840000);
    return () => clearInterval(fetch_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset default game settings when play modal is opened.
    if (showPlayModal) {
      console.log("Play modal opened. Resetting game settings.");
      setGameSettings({
        ortolayer: "avoindata:Ortoilmakuva_1943",
        dragging: true,
        timed: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPlayModal]);

  /**
   * Loads daily challenges from the database.
   */
  async function fetchDailies() {
    try {
      const response: DailyChallenge[] = await calendarservice.getAll();
      console.log("Dailies fetched, response:", response);
      setDailyChallenges(response);
      const dailyChallenge = response.find(
        (daily) => daily.date === dayjs().format("YYYY-MM-DD"),
      );
      if (dailyChallenge) {
        console.log("Daily challenge found for today! Showing daily button.");
        setChallenge(dailyChallenge);
      } else {
        console.log("Cannot find daily challenge for today!");
      }
    } catch (error) {
      console.log("Cannot fetch dailies:", error);
    }
  }

  const handleClosePlay = () => setPlayModal(false);
  const handleShowPlay = () => setPlayModal(true);

  const handleCloseHelp = () => setHelpModal(false);
  const handleShowHelp = () => setHelpModal(true);

  const handleCloseCalendar = () => setCalendarModal(false);
  const handleShowCalendar = () => setCalendarModal(true);

  const handleCloseDailyChallenge = () => setDailyChallengeModal(false);
  const handleShowDailyChallenge = () => setDailyChallengeModal(true);

  // Settings for the background map in the main menu
  const ortoLayer: MapLayerName = "avoindata:Ortoilmakuva_2024_5cm";
  const wmsOptions = wmsOptionsForMapLayer(ortoLayer);
  const mapOptions: L.MapOptions = {
    center: getRandomLatLng(ortoLayer),
    zoom: 17,
    scrollWheelZoom: false,
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
  };

  return (
    <>
      <PlayModal
        show={showPlayModal}
        handleClosePlay={handleClosePlay}
        setGameSettings={setGameSettings}
        gameSettings={gameSettings}
        setChallenge={setChallenge}
      />

      {showDailyChallengeModal && challenge && (
        <DailyChallengeModal
          show={showDailyChallengeModal}
          handleCloseDailyChallenge={handleCloseDailyChallenge}
          challenge={challenge}
          setGameSettings={setGameSettings}
        />
      )}

      {showHelpModal && (
        <HelpModal show={showHelpModal} handleCloseHelp={handleCloseHelp} />
      )}

      {showCalendarModal && (
        <Calendar
          show={showCalendarModal}
          handleCloseCalendar={handleCloseCalendar}
          setChallenge={setChallenge}
          setGameSettings={setGameSettings}
          dailyChallenges={dailyChallenges}
        />
      )}
      <MapContainer id="map" {...mapOptions}>
        <WMSTileLayer {...wmsOptions} />
      </MapContainer>

      <div id="menu-title">Ruuturetki</div>

      <div id="start-menu" className="d-grid gap-2">
        <Button variant="dark" size="lg" onClick={() => handleShowPlay()}>
          play
        </Button>
        {challenge && (
          <Button
            variant="dark"
            size="lg"
            onClick={() => handleShowDailyChallenge()}
          >
            daily challenge
          </Button>
        )}
        <Button variant="dark" size="lg" onClick={() => navigate("/practice")}>
          practice
        </Button>
        <Button variant="dark" size="lg" onClick={() => handleShowCalendar()}>
          calendar
        </Button>
        <Button variant="dark" size="lg" onClick={() => handleShowHelp()}>
          how to play
        </Button>
      </div>
    </>
  );
}

function App() {
  const htmlElement = document.querySelector("html");
  if (htmlElement) {
    htmlElement.setAttribute("data-bs-theme", "dark");
  }
  // Set default game settings when the main menu is loaded
  // Default game settings
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    dragging: true,
    timed: null,
    ortolayer: "avoindata:Ortoilmakuva_1943",
  });
  const [challenge, setChallenge] = useState<DailyChallenge | undefined>(
    undefined,
  );

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/game"
            element={<Game gameSettings={gameSettings} challenge={challenge} />}
          />
          <Route path="/practice" element={<Practice />} />
          <Route
            path="/"
            element={
              <StartMenu
                setGameSettings={setGameSettings}
                gameSettings={gameSettings}
                challenge={challenge}
                setChallenge={setChallenge}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
