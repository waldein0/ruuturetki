import type Map from "leaflet";

declare global {
  // Add maps used in Ruuturetki to global variables
  // to use the Leaflet map API in tests
  interface Window {
    viewMap?: Map;
    selectionMap?: Map;
    curatorMap?: Map;
    practiceMap?: Map;
  }
}

export {};
