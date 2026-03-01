import { Button, Modal } from "react-bootstrap";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PickersDay, StaticDatePicker } from "@mui/x-date-pickers";
import { useEffect, useMemo, useState } from "react";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { DailyChallenge, DailyScore, GameSettings } from "../../types/types";
import { MapContainer, TileLayer } from "react-leaflet";
import MapMarkers from "../MapMarkers";
import { useNavigate } from "react-router-dom";
import {
  cityForMapLayer,
  getCityCenter,
  tileLayerOptions,
} from "../../utils/mapLayerHelpers";
import DailyScoresTable from "../DailyScoresTable";
import fetchDailyScores from "../../utils/fetchDailyScores";
import DailyChallengeInfoTable from "../DailyChallengeInfoTable";

// Set monday as the first day of the week
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1,
});
// Create a dark theme for the calendar
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
// Some arbitrary data for testing the calendar
// const dailyChallengesExamples: DailyChallenge[] = [
//   {
//     date: "2026-02-11",
//     dailyChallenge: [
//       {
//         id: 0,
//         latlng: {
//           lat: 60.17072018908489,
//           lng: 24.93802070617676,
//         },
//         zoom: 16,
//       },
//       {
//         id: 1,
//         latlng: {
//           lat: 60.17313229308546,
//           lng: 24.93973731994629,
//         },
//         zoom: 16,
//       },
//       {
//         id: 2,
//         latlng: {
//           lat: 60.17347381562102,
//           lng: 24.94458675384522,
//         },
//         zoom: 16,
//       },
//       {
//         id: 3,
//         latlng: {
//           lat: 60.171638090243235,
//           lng: 24.945359230041507,
//         },
//         zoom: 16,
//       },
//       {
//         id: 4,
//         latlng: {
//           lat: 60.169994388616885,
//           lng: 24.942355155944824,
//         },
//         zoom: 16,
//       },
//     ],
//     maplayer: "avoindata:Ortoilmakuva_2019_20cm",
//     moving: true,
//     timed: false,
//   },
//   {
//     date: "2026-02-21",
//     dailyChallenge: [
//       {
//         id: 0,
//         latlng: {
//           lat: 60.17072018908489,
//           lng: 24.93802070617676,
//         },
//         zoom: 16,
//       },
//       {
//         id: 1,
//         latlng: {
//           lat: 60.17313229308546,
//           lng: 24.93973731994629,
//         },
//         zoom: 16,
//       },
//       {
//         id: 2,
//         latlng: {
//           lat: 60.17347381562102,
//           lng: 24.94458675384522,
//         },
//         zoom: 16,
//       },
//       {
//         id: 3,
//         latlng: {
//           lat: 60.171638090243235,
//           lng: 24.945359230041507,
//         },
//         zoom: 16,
//       },
//       {
//         id: 4,
//         latlng: {
//           lat: 60.169994388616885,
//           lng: 24.942355155944824,
//         },
//         zoom: 16,
//       },
//     ],
//     maplayer: "avoindata:Ortoilmakuva_2019_20cm",
//     moving: true,
//     timed: false,
//   },
//   {
//     date: "2026-02-22",
//     dailyChallenge: [
//       {
//         id: 0,
//         latlng: {
//           lat: 60.17072018908489,
//           lng: 24.93802070617676,
//         },
//         zoom: 16,
//       },
//       {
//         id: 1,
//         latlng: {
//           lat: 60.17313229308546,
//           lng: 24.93973731994629,
//         },
//         zoom: 16,
//       },
//       {
//         id: 2,
//         latlng: {
//           lat: 60.17347381562102,
//           lng: 24.94458675384522,
//         },
//         zoom: 16,
//       },
//       {
//         id: 3,
//         latlng: {
//           lat: 60.171638090243235,
//           lng: 24.945359230041507,
//         },
//         zoom: 16,
//       },
//       {
//         id: 4,
//         latlng: {
//           lat: 60.169994388616885,
//           lng: 24.942355155944824,
//         },
//         zoom: 16,
//       },
//     ],
//     maplayer: "avoindata:Ortoilmakuva_2019_20cm",
//     moving: true,
//     timed: false,
//   },
//   {
//     date: "2026-02-05",
//     dailyChallenge: [
//       {
//         id: 0,
//         latlng: {
//           lat: 60.44902768614139,
//           lng: 22.25903034210205,
//         },
//         zoom: 15,
//       },
//       {
//         id: 1,
//         latlng: {
//           lat: 60.45307009236637,
//           lng: 22.272462844848633,
//         },
//         zoom: 15,
//       },
//       {
//         id: 2,
//         latlng: {
//           lat: 60.44964148702026,
//           lng: 22.275724411010746,
//         },
//         zoom: 15,
//       },
//       {
//         id: 3,
//         latlng: {
//           lat: 60.443841664076615,
//           lng: 22.290616035461426,
//         },
//         zoom: 15,
//       },
//       {
//         id: 4,
//         latlng: {
//           lat: 60.44418036833581,
//           lng: 22.243494987487793,
//         },
//         zoom: 15,
//       },
//     ],
//     maplayer: "Turku ilmakuva 1998",
//     moving: true,
//     timed: 15,
//   },
// ];

/**
 * A calendar modal for viewing daily challenges.
 */
export default function Calendar({
  show,
  handleCloseCalendar,
  setChallenge,
  setGameSettings,
  dailyChallenges,
}: {
  show: boolean;
  handleCloseCalendar: () => void;
  setChallenge: React.Dispatch<
    React.SetStateAction<DailyChallenge | undefined>
  >;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  dailyChallenges: DailyChallenge[];
}) {
  // Initialize state variables
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);

  // Convert dailychallenge dates to a set for faster lookup
  const dateSet = useMemo(() => {
    try {
      const set = new Set(dailyChallenges.map((daily) => daily.date));
      // console.log("Memoized set:", set);
      return set;
    } catch (error) {
      console.log("Cannot convert daily challenges dates to a set:", error);
      return new Set(""); // Return empty set if the conversion fails
    }
  }, [dailyChallenges]);

  /**
   * Handles clicking different dates on the calendar by saving
   * the date to the component's state.
   * */
  const handleDateChange = (date: PickerValue) =>
    date === null
      ? console.log("Invalid date selected!")
      : setSelectedDate(date);

  // Next two functions run for every visible day in the calendar.
  // The functions highlight days that have a daily challenge and do
  // nothing for the days that don't have challenges yet.
  const HighlightedDay = styled(PickersDay)(({ theme }) => ({
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  }));
  const CustomDay = function CustomDay({
    day,
    outsideCurrentMonth,
    onDaySelect,
    isFirstVisibleCell,
    isLastVisibleCell,
  }: {
    day: dayjs.Dayjs;
    outsideCurrentMonth: boolean;
    onDaySelect: (day: dayjs.Dayjs) => void;
    isFirstVisibleCell: boolean;
    isLastVisibleCell: boolean;
  }) {
    const isSelected =
      !outsideCurrentMonth && dateSet.has(day.format("YYYY-MM-DD"));
    return (
      <HighlightedDay
        selected={isSelected}
        isFirstVisibleCell={isFirstVisibleCell}
        isLastVisibleCell={isLastVisibleCell}
        onDaySelect={onDaySelect}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    );
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleCloseCalendar}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Daily Calendar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="calendar-modal-body">
            <div className="calendar">
              <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <StaticDatePicker
                    defaultValue={today}
                    slots={{ day: CustomDay }} // Highlight days with daily challenges
                    slotProps={{ actionBar: { actions: [] } }} // Disable default buttons
                    displayWeekNumber // Important
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
              </ThemeProvider>
            </div>
            <div className="daily-challenge-content">
              <DailyChallengeContent
                dailyChallenges={dailyChallenges}
                selectedDate={selectedDate}
                setChallenge={setChallenge}
                setGameSettings={setGameSettings}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

/**
 * Renders a daily challenge content if the challenge exists for the selected date.
 */
function DailyChallengeContent({
  dailyChallenges,
  selectedDate,
  setChallenge,
  setGameSettings,
}: {
  dailyChallenges: DailyChallenge[];
  selectedDate: dayjs.Dayjs;
  setChallenge: React.Dispatch<
    React.SetStateAction<DailyChallenge | undefined>
  >;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}) {
  const navigate = useNavigate();
  const [scores, setScores] = useState<DailyScore[]>([]);

  useEffect(() => {
    // Get scores for the daily challenge
    fetchDailyScores(selectedDate, setScores);
  }, [selectedDate]);

  // Find a daily challenge corresponding to the selected date
  let dailyChallenge: DailyChallenge | undefined;
  try {
    dailyChallenge = dailyChallenges.find(
      (daily) => daily.date === selectedDate.format("YYYY-MM-DD"),
    );
  } catch (error) {
    console.log("Cannot find daily challenge:", error);
  }
  // Exit early if no daily challenge for the selected date
  if (dailyChallenge === undefined)
    return (
      <>
        <h5>Daily challenge for {selectedDate.format("YYYY-MM-DD")}</h5>
        <i>No challenge available</i>
      </>
    );

  // Define options for map view and markers
  const center = getCityCenter(cityForMapLayer(dailyChallenge.maplayer));
  const mapOptions: L.MapOptions = {
    center: center,
    zoom: 13,
  };
  const roundLocations = dailyChallenge.dailyChallenge.map(
    (round) => round.latlng,
  );

  // Clicking play starts a game with the selected challenge
  const handlePlay = () => {
    setChallenge(dailyChallenge);
    setGameSettings({
      ortolayer: dailyChallenge.maplayer,
      dragging: dailyChallenge.moving,
      timed: dailyChallenge.timed,
    });
    navigate("/game");
  };

  const today = dayjs();
  const beforeToday = selectedDate.isBefore(today, "day");
  const afterToday = !beforeToday;
  const isToday = today.isSame(selectedDate, "day");

  return (
    <>
      <h5>
        Daily challenge for{" "}
        {isToday ? "today" : selectedDate.format("YYYY-MM-DD")}
      </h5>
      <DailyChallengeInfoTable challenge={dailyChallenge} />
      {/* Play button shown only for todays challenge */}
      {isToday && (
        <Button variant="secondary" onClick={handlePlay}>
          play
        </Button>
      )}
      {/* Map view of the locations. Shown only for past dates. */}
      {beforeToday && (
        <MapContainer id="calendar-map" {...mapOptions}>
          <TileLayer {...tileLayerOptions()} />
          <MapMarkers locations={roundLocations} delay={0} />
        </MapContainer>
      )}
      {/* Text to display for challenges in the place of the map */}
      {afterToday && (
        <p>
          Locations are revealed a day after the challenge date. For this
          challenge the reveal date will be{" "}
          {selectedDate.add(1, "day").format("YYYY-MM-DD")}.
        </p>
      )}
      {scores.length !== 0 && <DailyScoresTable dailyScores={scores} />}
    </>
  );
}
