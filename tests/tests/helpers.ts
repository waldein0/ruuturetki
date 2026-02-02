import type { Page } from "@playwright/test";

type MapType = "practiceMap" | "viewMap" | "selectionMap" | "curatorMap";

/**
 * Returns wms ortolayer name.
 */
export function getWMSLayerName(page: Page, mapType: MapType) {
  return page.evaluate((mapType) => {
    // Access correct map API
    const map = window[mapType];

    // Handle map is undefined
    if (!map) {
      throw new Error(`Expected window.${mapType} to be defined`);
    }

    // Get and return ortolayer name
    let name = "";
    map.eachLayer((layer) => {
      if (layer instanceof window.L.TileLayer.WMS && layer.options?.layers) {
        name = layer.options.layers;
      }
    });
    return name;
  }, mapType);
}
/**
 * Returns map center latitude and longitude.
 */
export function getMapCenter(page: Page, mapType: MapType) {
  return page.evaluate((mapType) => {
    // Access correct map API
    const map = window[mapType];

    // Handle map is undefined
    if (!map) {
      throw new Error("Expected window.viewMap to be defined");
    }

    // Get and return map center
    const center = map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }, mapType);
}
