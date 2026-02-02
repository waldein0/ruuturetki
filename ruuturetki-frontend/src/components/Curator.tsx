import { Button, Form, Modal } from "react-bootstrap";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import markerIcon from "./MarkerIcon";
import { CuratorRound, FormEvent } from "../types/types";

export default function Curator({ mapLayer }: { mapLayer: string }) {
  // TO DO: implement admin check
  // ...

  // Comment the next line to use curator mode
  // return null;

  const [curatorRounds, setCuratorRounds] = useState<CuratorRound[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showZoomSelection, setShowZoomSelection] = useState(false);
  const [showCuratorEndModal, setShowCuratorEndModal] = useState(false);
  const [id, setId] = useState(0);
  const map = useMap();

  // Save map click locations to the state
  useMapEvents({
    click(e) {
      if (curatorRounds.length < 5) {
        // setCuratorLocations(curatorLocations.concat(e.latlng));
        setCuratorRounds((prevState) =>
          prevState.concat({
            id: curatorRounds.length,
            latlng: e.latlng,
            zoom: 16,
            draggable: false,
          }),
        );
      }
      // Alert if map is clicked after selecting 5 locations and zoom selection is not opened yet
      if (curatorRounds.length === 5 && !showZoomSelection) {
        alert(
          "You have selected a sufficient number of locations. Click Set locations to continue to the zoom selection.",
        );
      }
    },
  });

  const handleSetLocations = () => {
    // This function continues to the zoom selection by checking
    // if locations are guessed correctly and making required preparations.

    // Alert the user if insufficient number of locations clicked
    if (curatorRounds.length < 5) {
      alert(
        `Click ${5 - curatorRounds.length} more location(s) before continuing!`,
      );
      return;
    }
    // Alert the user if zoom selection is in progress
    if (showZoomSelection) {
      alert(
        `You are selecting a zoom level for the round ${
          curatorRounds.length + 1
        }. Click ${
          curatorRounds.length === 4 ? "end" : "next"
        } to select current zoom and continue.`,
      );
      return;
    }

    // Prepare for the zoom selection
    // Center the map to the first location and enable dragging the 1st marker
    map.setView(curatorRounds[0].latlng, 16);
    setCuratorRounds((curatorRounds) =>
      curatorRounds.map((c) => (c.id === 0 ? { ...c, draggable: true } : c)),
    );
    // Disable moving and scrollwheel zooming
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    // Continue to the zoom selection
    setShowZoomSelection(true);
  };

  const handleReset = () => {
    // This function fully resets the progress of creating a daily challenge
    // in the curator mode.

    // Remove any selected locations
    setCuratorRounds([]);
    // Reset zoom selection id
    setId(0);
    // Hide zoom selection UI
    setShowZoomSelection(false);
    // Enable map movement
    map.dragging.enable();
    map.scrollWheelZoom.enable();
  };

  const handleNext = (id: number) => {
    // This function saves current map zoom level, handles
    // continuing to the next zoom selection and handles ending the zoom selection

    // Save selected zoom level to curators state
    setCuratorRounds((prevState) =>
      prevState.map((c) => (c.id === id ? { ...c, zoom: map.getZoom() } : c)),
    );

    // Continue to the next location or to the submit daily form
    if (id === 4) {
      // On the last round continue to the submit daily form
      setShowCuratorEndModal(true);
    } else {
      // Otherwise continue to the next location
      setId(id + 1);
      map.setView(curatorRounds[id + 1].latlng);
      // Enable dragging the next marker and disable dragging the current marker
      setCuratorRounds((prevState) =>
        prevState.map((c) => {
          if (c.id === id) return { ...c, draggable: false };
          else if (c.id === id + 1) return { ...c, draggable: true };
          else return c;
        }),
      );
    }
  };

  // Trick for disabling map click event handling when curator control buttons are clicked
  const refSet = useRef(null);
  const refReset = useRef(null);
  useEffect(() => {
    if (refSet.current) {
      L.DomEvent.disableClickPropagation(refSet.current);
    }
    if (refReset.current) {
      L.DomEvent.disableClickPropagation(refReset.current);
    }
  }, []);

  return (
    <>
      <div id="curator-controls">
        <Button
          ref={refSet}
          variant="dark"
          onClick={handleSetLocations}
          onMouseOver={() => {
            setShowInfo(true);
          }}
          onMouseOut={() => {
            setShowInfo(false);
          }}
        >
          Set locations
        </Button>
        <Button
          ref={refReset}
          variant="dark"
          onClick={() => {
            return confirm(
              "Are you sure you want to reset your curator progress?",
            )
              ? handleReset()
              : () => {};
          }}
          onMouseOver={() => {
            setShowInfo(true);
          }}
          onMouseOut={() => {
            setShowInfo(false);
          }}
        >
          Reset
        </Button>
      </div>
      <div id="curator-info">
        {showInfo && !showZoomSelection ? (
          <h5>
            Click on the map to select 5 locations. When ready, click Set
            locations to continue to zoom selection.
          </h5>
        ) : null}
      </div>
      <div id="curator-zoom-selection">
        {showZoomSelection && id < 5
          ? ZoomSelection(map, id, handleNext)
          : null}
      </div>
      <div id="curator-map-markers">
        {curatorRounds.map((round) => (
          <CuratorMarker
            position={round.latlng}
            index={round.id}
            key={round.id}
            draggable={round.draggable}
            setCuratorRounds={setCuratorRounds}
            map={map}
          />
        ))}
      </div>
      <div id="curator-end-modal">
        {showCuratorEndModal ? (
          <CuratorEndModal
            showCuratorEndModal={showCuratorEndModal}
            setShowCuratorEndModal={setShowCuratorEndModal}
            curatorRounds={curatorRounds}
            mapLayer={mapLayer}
            handleReset={handleReset}
          />
        ) : null}
      </div>
    </>
  );
}

/**
 * Returns UI for selecting the zoom for the daily challenge locations.
 */
function ZoomSelection(
  map: L.Map,
  id: number,
  handleNext: (id: number) => void,
) {
  return (
    <>
      <h5>Select zoom level for round {id + 1} location. </h5>
      <div id="curator-zoom-selection-controls">
        <Form.Range
          min={14}
          max={18}
          onInput={(event) => {
            const target = event.target as HTMLInputElement;
            map.setZoom(Number(target.value));
          }}
        />
        <Button
          variant="dark"
          onClick={() => {
            handleNext(id);
          }}
        >
          {id < 4 ? "Next" : "End"}
        </Button>
      </div>
    </>
  );
}

/**
 * Returns a map marker. If the marker is draggable,
 * updates the new location to the curator state after dragging.
 */
function CuratorMarker({
  position,
  index,
  draggable,
  setCuratorRounds,
  map,
}: {
  position: L.LatLng;
  index: number;
  draggable: boolean;
  setCuratorRounds: React.Dispatch<React.SetStateAction<CuratorRound[]>>;
  map: L.Map;
}) {
  // Update the location after dragging the marker
  const handleDrag = (e: L.DragEndEvent) => {
    const latlng = e.target.getLatLng();
    setCuratorRounds((prevState) =>
      prevState.map((c) => (c.id === index ? { ...c, latlng: latlng } : c)),
    );
    // Move to the new location
    map.setView(latlng);
  };

  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable={draggable}
      eventHandlers={{ dragend: handleDrag }}
    >
      <Tooltip permanent>{index + 1}</Tooltip>
    </Marker>
  );
}

/**
 * Returns a form for submitting the daily challenge and a map view of
 * the daily challenge locations.
 */
function CuratorEndModal({
  showCuratorEndModal,
  setShowCuratorEndModal,
  curatorRounds,
  mapLayer,
  handleReset,
}: {
  showCuratorEndModal: boolean;
  setShowCuratorEndModal: React.Dispatch<React.SetStateAction<boolean>>;
  curatorRounds: CuratorRound[];
  mapLayer: string;
  handleReset: () => void;
}) {
  const returnToPractice = () => {
    // Reset curator mode and return to the practice mode
    setShowCuratorEndModal(false);
    handleReset();
  };

  const handleSubmit = (event: FormEvent) => {
    // This form event handler submits the daily challenge to the daily calendar
    // and returns to the practice mode
    event.preventDefault();

    // Submit the daily challenge to the daily calendar
    const selectedDate = event.currentTarget.date.value;
    console.log("Date selected:", selectedDate);
    console.log("Submit daily:", curatorRounds);
    console.log("maplayer:", mapLayer);
    // TO DO:
    // ...

    returnToPractice();
  };

  const handleClose = () => {
    if (confirm("Return to practice map without submitting daily challenge?")) {
      returnToPractice();
    }
  };

  return (
    <Modal show={showCuratorEndModal} size="lg" backdrop>
      <Modal.Header>
        <Modal.Title style={{ marginLeft: "0.5rem" }}>
          Curator mode summary
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="curator-end-modal">
        <Form id="curator-form" onSubmit={handleSubmit}>
          <h5>Select date for your daily challenge</h5>
          <Form.Control id="date" type="date" />
          <h5>Your daily challenge locations</h5>
          <MapContainer
            id="map"
            center={L.latLng(60.170678, 24.941543)}
            zoom={12}
          >
            <TileLayer
              attribution={
                '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              }
              url={
                "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
              }
            />
            <DailyChallengeMarkers
              locations={curatorRounds.map((c) => c.latlng)}
            />
          </MapContainer>
          <div id="curator-end-controls">
            <Button variant="secondary" onClick={handleClose}>
              Close summary
            </Button>
            <Button variant="secondary" type="submit">
              Submit your daily challenge
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

/**
 * Returns markers for the provided latlng locations
 * and fits the map view to the markers after the delay.
 */
function DailyChallengeMarkers({
  locations,
  delay = 1500,
}: {
  locations: L.LatLng[];
  delay?: number;
}) {
  const map = useMap();
  useEffect(() => {
    window.curatorMap = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  setTimeout(() => {
    map.fitBounds(L.latLngBounds(locations), { padding: [50, 50] });
  }, delay);

  return (
    <>
      {locations.map((position, index) => (
        <Marker position={position} key={index}>
          <Tooltip permanent>{index + 1}</Tooltip>
        </Marker>
      ))}
    </>
  );
}
