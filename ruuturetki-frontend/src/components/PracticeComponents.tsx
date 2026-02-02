import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function PracticeComponents({
  mapLayer,
  setMapLayer,
  setPracticePos,
  setPracticeZoom,
}: {
  mapLayer: string;
  setMapLayer: React.Dispatch<React.SetStateAction<string>>;
  setPracticePos: React.Dispatch<React.SetStateAction<L.LatLng>>;
  setPracticeZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  const navigate = useNavigate();

  //
  const map = useMap();
  const onMove = () => {
    setPracticePos(map.getCenter());
    setPracticeZoom(map.getZoom());
  };
  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Add Leaflet map API to window for getting map states in tests
  useEffect(() => {
    window.practiceMap = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div id="prac-controls">
        <Button id="faux-button" variant="dark">
          <Form className="prac-controls">
            <Form.Check
              inline
              label="1943"
              type="radio"
              defaultChecked={mapLayer === "avoindata:Ortoilmakuva_1943"}
              onClick={() => setMapLayer("avoindata:Ortoilmakuva_1943")}
            />
            <Form.Check
              inline
              label="1969"
              type="radio"
              defaultChecked={mapLayer === "avoindata:Ortoilmakuva_1969"}
              onClick={() => setMapLayer("avoindata:Ortoilmakuva_1969")}
            />
            <Form.Check
              inline
              label="1997"
              type="radio"
              defaultChecked={mapLayer === "avoindata:Ortoilmakuva_1997"}
              onClick={() => setMapLayer("avoindata:Ortoilmakuva_1997")}
            />
            <Form.Check
              inline
              label="2024"
              type="radio"
              defaultChecked={mapLayer === "avoindata:Ortoilmakuva_2024_5cm"}
              onClick={() => setMapLayer("avoindata:Ortoilmakuva_2024_5cm")}
            />
          </Form>
        </Button>
        <Button id="home-button" variant="dark" onClick={() => navigate("/")}>
          Exit
        </Button>
      </div>
    </>
  );
}

export default PracticeComponents;
