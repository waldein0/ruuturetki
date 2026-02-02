import L from "leaflet";
import { useMapEvents, useMap, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import markerIcon from "./MarkerIcon.tsx";
import { GameState } from "../types/types.ts";

function LocationPicker({
  gameState,
  setGameState,
}: {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  // Marker for the guessed location
  const [marker, setMarker] = useState<null | L.LatLng>(null);

  // Get the starting position of each round from gameState
  const startPosition = gameState.locations[gameState.roundId];

  // Center the selection map when a round starts
  const mapInstance = useMap();
  useEffect(() => {
    mapInstance.setView(L.latLng(60.18, 24.95), 11);
    setMarker(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPosition]);
  // Add Leaflet map API to window for getting map states in tests
  useEffect(() => {
    window.selectionMap = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to selection map events (location guesses and hover)
  const map = useMapEvents({
    // Location guesses
    click: (e) => {
      // Get guessed location
      const guessedLocation = e.latlng;
      // console.log('Clicked a position on SelectionMap:', guessedLocation)

      // Get previous round guesses
      const oldGuesses = gameState.guesses.slice(0, gameState.roundId);

      // Set or (if already set) reset the guess to the gameState
      setGameState({
        ...gameState,
        picked: true,
        guesses: oldGuesses.concat(guessedLocation),
      });

      // Show marker of the guess on the selection map
      setMarker(guessedLocation);
    },

    // Switch to larger or smaller selection map
    mouseover: () => {
      map.invalidateSize();
    },
    mouseout: () => {
      map.invalidateSize();
    },
  });

  return marker ? <Marker position={marker} icon={markerIcon} /> : null;
}

export default LocationPicker;
