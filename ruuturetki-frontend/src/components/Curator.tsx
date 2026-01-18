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
import { FormEvent } from "../types/types";

export default function Curator({ mapLayer }: { mapLayer: string }) {
  // TO DO: implement admin check
  // ...

  // Comment the next line to use curator mode
  // return null;

  const [curatorLocations, setCuratorLocations] = useState<L.LatLng[]>([]);
  const [curatorZooms, setCuratorZooms] = useState<number[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showZoomSelection, setShowZoomSelection] = useState(false);
  const [showCuratorEndModal, setShowCuratorEndModal] = useState(false);
  const [id, setId] = useState(0);
  const map = useMap();
  // Save map click locations to the state
  useMapEvents({
    click(e) {
      if (curatorLocations.length < 5) {
        setCuratorLocations(curatorLocations.concat(e.latlng));
      }
      // Alert if map is clicked after selecting 5 locations and zoom selection is not opened yet
      if (curatorLocations.length === 5 && !showZoomSelection) {
        alert(
          "You have selected a sufficient number of locations. Click Set locations to continue to the zoom selection.",
        );
      }
    },
  });

  const handleSetLocations = () => {
    // This function checks if the user has selected locations
    // correctly. If so, it continues to the zoom selection.

    // Alert the user if insufficient number of locations clicked
    if (curatorLocations.length < 5) {
      alert(
        `Click ${
          5 - curatorLocations.length
        } more location(s) before continuing!`,
      );
      return;
    }
    // Alert the user if zoom selection is in progress
    if (showZoomSelection) {
      alert(
        `You are selecting a zoom level for the round ${
          curatorZooms.length + 1
        }. Click ${
          curatorZooms.length === 4 ? "end" : "next"
        } to select current zoom and continue.`,
      );
      return;
    }

    // Center the map to the first location
    map.setView(curatorLocations[0], 16);
    // Disable moving and scrollwheel zooming
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    // Continue to the zoom selection
    setShowZoomSelection(true);
  };

  const handleReset = () => {
    // This function resets curator selection to the initial state:
    // 1) clear selected locations, zooms and their ids
    // 2) hide zoom selection
    // 3) enable moving and scrollwheel zooming
    setCuratorLocations([]);
    setCuratorZooms([]);
    setId(0);
    setShowZoomSelection(false);
    map.dragging.enable();
    map.scrollWheelZoom.enable();
  };

  const handleNext = () => {
    // This function saves current map zoom level, handles
    // continuing to the next zoom selection and handles ending the zoom selection

    // Save selected zoom to curators state
    setCuratorZooms(curatorZooms.concat(map.getZoom()));
    // On the last round get results of the selected locations and zooms
    if (id === 4) {
      // Show submit form
      setShowCuratorEndModal(true);
      // Reset curator mode
      // handleReset();
    } else {
      // Continue to the next location if it isn't the last round
      setId(id + 1);
      map.setView(curatorLocations[id + 1]);
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
      <div id="curator-end-modal">
        {showCuratorEndModal ? (
          <CuratorEndModal
            showCuratorEndModal={showCuratorEndModal}
            setShowCuratorEndModal={setShowCuratorEndModal}
            curatorLocations={curatorLocations}
            curatorZooms={curatorZooms}
            mapLayer={mapLayer}
            handleReset={handleReset}
          />
        ) : null}
      </div>
      <div id="curator-map-markers">
        {curatorLocations.map((position, index) => (
          <CuratorMarker position={position} index={index} key={index} />
        ))}
      </div>
    </>
  );
}

function ZoomSelection(map: L.Map, id: number, handleNext: () => void) {
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
        <Button variant="dark" onClick={handleNext}>
          {id < 4 ? "Next" : "End"}
        </Button>
      </div>
    </>
  );
}

function CuratorMarker({
  position,
  index,
}: {
  position: L.LatLng;
  index: number;
}) {
  return (
    <Marker position={position} icon={markerIcon}>
      <Tooltip permanent>{index + 1}</Tooltip>
    </Marker>
  );
}

function CuratorEndModal({
  showCuratorEndModal,
  setShowCuratorEndModal,
  curatorLocations,
  curatorZooms,
  mapLayer,
  handleReset,
}: {
  showCuratorEndModal: boolean;
  setShowCuratorEndModal: React.Dispatch<React.SetStateAction<boolean>>;
  curatorLocations: L.LatLng[];
  curatorZooms: number[];
  mapLayer: string;
  handleReset: () => void;
}) {
  const result = {
    locations: curatorLocations,
    zooms: curatorZooms, // State is not updated for the last zoom
    layer: mapLayer,
  };

  const handleSubmit = (event: FormEvent) => {
    // This function submits the daily challenge to the daily calendar
    // and returns to the practice mode
    event.preventDefault();

    // Submit the daily challenge to the daily calendar
    const selectedDate = event.currentTarget.date.value;
    console.log("Date selected:", selectedDate);
    console.log("Submit daily:", result);
    // TO DO:
    // ...

    // Reset curator mode and return to the practice mode
    setShowCuratorEndModal(false);
    handleReset();
  };
  const handleClose = () => {
    if (confirm("Return to practice map without submitting daily challenge?")) {
      setShowCuratorEndModal(false);
      handleReset();
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
            <CuratorSelectedLocations curatorLocations={curatorLocations} />
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

function CuratorSelectedLocations({
  curatorLocations,
}: {
  curatorLocations: L.LatLng[];
}) {
  const map = useMap();
  useEffect(() => {
    window.curatorMap = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  setTimeout(() => {
    map.fitBounds(L.latLngBounds(curatorLocations), { padding: [50, 50] });
  }, 1500);
  return (
    <>
      {curatorLocations.map((position, index) => (
        <CuratorMarker position={position} index={index} key={index} />
      ))}
    </>
  );
}
