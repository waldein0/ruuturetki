import { test, expect } from "@playwright/test";
import { getMapCenter, getWMSLayerName } from "./helpers";
import type { LatLngLiteral } from "leaflet";

test.describe("Ruuturetki main menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("main menu can be opened", async ({ page }) => {
    await expect(page.getByText("Ruuturetki")).toBeVisible();
    await expect(page).toHaveTitle("Ruuturetki");
    await expect(page.getByRole("button", { name: "play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "practice" })).toBeVisible();
    await expect(page.getByRole("button", { name: "help" })).toBeVisible();
  });

  test("play modal can be opened", async ({ page }) => {
    await page.getByRole("button", { name: "play" }).click();
    await expect(page.getByText("Time to get mapping!")).toBeVisible();
    // Toggle timed and no moving mode selectors
    await page.getByRole("checkbox").first().click();
    await page.getByRole("checkbox").last().click();
    await page.getByRole("checkbox").first().click();
    await page.getByRole("checkbox").last().click();
    // Return to main menu
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Ruuturetki")).toBeVisible();
  });

  test("practice mode can be opened", async ({ page }) => {
    await page.getByRole("button", { name: "practice" }).click();
    // Return to main menu
    await page.getByRole("button", { name: "Exit" }).click();
    await expect(page.getByText("Ruuturetki")).toBeVisible();
  });

  test("help modal can be opened", async ({ page }) => {
    await page.getByRole("button", { name: "help" }).click();
    await expect(page.getByText("How to play?")).toBeVisible();
    // Return to main menu
    await page.getByLabel("Close").click();
    await expect(page.getByText("Ruuturetki")).toBeVisible();
  });
});

test.describe("Game components function as expected", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByText("play").click();
    // Any ortolayer can be selected (older = faster)
    await page.getByText("1940's").click();
  });

  test("all rounds can be skipped", async ({ page }) => {
    // 1st round
    const skipButton = page.getByText("Skip");
    // Get 1st round location
    const location = await getMapCenter(page, "viewMap");
    await skipButton.click();

    // 2nd round
    await expect(page.getByText("2/5")).toBeVisible();
    // Location has changed on skip
    expect(location).not.toBe(await getMapCenter(page, "viewMap"));
    await skipButton.click();

    // 3rd Round
    await expect(page.getByText("3/5")).toBeVisible();
    // Make a guess, but then decide to skip the round anyway
    await page.locator("#selector-map").click({ position: { x: 100, y: 30 } });
    await skipButton.click();

    // 4th round
    await expect(page.getByText("4/5")).toBeVisible();
    // TO DO add events before clicking skip
    // ...
    await skipButton.click();

    // 5th round
    await expect(page.getByText("5/5")).toBeVisible();
    // TO DO add events before clicking skip
    // ...
    await skipButton.click();

    // Game summary
    await expect(page.getByText("Round 5/5 score:")).toBeVisible();
    await expect(page.getByText("0 points for the round!")).toBeVisible();
    await expect(page.getByText("0 / 50 000 total points")).toBeVisible();
    // Two exit buttons
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(page.getByRole("button", { name: "End" })).toBeVisible();
    // Return to main menu
    await page.getByRole("button", { name: "End" }).click();
    await expect(page.getByText("Ruuturetki")).toBeVisible();
  });

  test("selection map", async ({ page }) => {
    // Selection map locator
    const selectionMap = page.locator("#selector-map");
    await expect(selectionMap).toBeVisible();
    // Map centers
    const selectionMapCenter = await getMapCenter(page, "selectionMap");
    const viewMapCenter = await getMapCenter(page, "viewMap");

    // Size changes on hover
    const sizeBefore = await selectionMap.boundingBox();
    await selectionMap.hover();
    const sizeAfter = await selectionMap.boundingBox();
    if (sizeAfter === null || sizeBefore === null) {
      throw new Error(
        "Expected the bounding box of the selection map to be defined",
      );
    }
    expect(sizeAfter.width).not.toBe(sizeBefore.width);
    expect(sizeAfter.height).not.toBe(sizeBefore.height);
    // Dragging
    const startX = sizeAfter.x + sizeAfter.width / 2;
    const startY = sizeAfter.y + sizeAfter.height / 2;
    // Drag the map to the right
    await page.mouse.down();
    await page.mouse.move(startX + 30, startY - 30, { steps: 10 });
    await page.mouse.up();
    // Wait for Leaflet to finish panning
    await page.waitForTimeout(300);
    // Get map center after dragging
    const selectionMapCenterAfter = await getMapCenter(page, "selectionMap");
    if (selectionMapCenter && selectionMapCenterAfter) {
      // Assert the map center changed
      expect(selectionMapCenterAfter.lat).not.toBeCloseTo(
        selectionMapCenter.lat,
        6,
      );
      expect(selectionMapCenterAfter.lng).not.toBeCloseTo(
        selectionMapCenter.lng,
        6,
      );
    } else {
      console.log("Error in selection map center");
    }

    // Click selection map to make a guess of the location
    await selectionMap.click({ position: { x: 100, y: 100 } });
    await expect(
      selectionMap.getByRole("button", { name: "Marker" }),
    ).toBeVisible();
    const markerLatLng = await page.evaluate(() => {
      let result: LatLngLiteral = { lat: 0, lng: 0 };
      if (window.selectionMap) {
        window.selectionMap.eachLayer((layer) => {
          if (layer instanceof window.L.Marker) {
            result = layer.getLatLng();
            return;
          }
        });
      }
      return { lat: result.lat, lng: result.lng };
    });
    expect(typeof markerLatLng.lat).toBe(typeof 0);
    expect(typeof markerLatLng.lng).toBe(typeof 0);

    // Click select button
    await page.getByRole("button", { name: "Select" }).click();
    await expect(page.getByText("Round 1/5 score:")).toBeVisible();
    // Guessed and correct locations shown on round end map
    await expect(
      page.getByRole("button", { name: "Marker" }).nth(2),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Marker" }).nth(3),
    ).toBeVisible();
    await page.getByText("Next").click();
    await expect(page.getByText("2/5")).toBeVisible();
    expect(viewMapCenter).not.toBe(await getMapCenter(page, "viewMap"));
    await selectionMap.hover();
    await selectionMap.click();
    await page.getByText("Select").click();
    expect(page.getByText("Round 2/5 score:")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.getByText("Next").click();
    await expect(page.getByText("3/5")).toBeVisible();

    await selectionMap.click();
    await page.getByText("Select").click();
    expect(page.getByText("Round 3/5 score:")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.getByText("Next").click();
    await expect(page.getByText("4/5")).toBeVisible();

    await page.mouse.click(sizeBefore.x + 10, sizeBefore.y + 10);
    await page.getByText("Select").click();
    expect(page.getByText("Round 4/5 score:")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.getByText("Next").click();
    await expect(page.getByText("5/5")).toBeVisible();

    await page.getByText("Skip").click();
    await expect(page.getByText("Round 5/5 score:")).toBeVisible();
    await expect(page.getByLabel("Close")).toBeVisible();
    await page.getByText("End").click();
    await expect(page.getByText("Ruuturetki")).toBeVisible();
  });
});

test.describe("Practice mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByText("Practice").click();
  });

  test("wms ortolayer changes on click", async ({ page }) => {
    let wmsLayerName: string | undefined;
    // 1st checkbox
    await page.getByRole("radio").first().check();
    wmsLayerName = await getWMSLayerName(page, "practiceMap");
    expect(wmsLayerName).toBe("avoindata:Ortoilmakuva_1943");

    // 2nd checkbox
    await page.getByRole("radio").nth(1).check();
    wmsLayerName = await getWMSLayerName(page, "practiceMap");
    expect(wmsLayerName).toBe("avoindata:Ortoilmakuva_1969");

    // 3rd checkbox
    await page.getByRole("radio").nth(2).check();
    wmsLayerName = await getWMSLayerName(page, "practiceMap");
    expect(wmsLayerName).toBe("avoindata:Ortoilmakuva_1997");

    // 4th checkbox
    await page.getByRole("radio").nth(3).check();
    wmsLayerName = await getWMSLayerName(page, "practiceMap");
    expect(wmsLayerName).toBe("avoindata:Ortoilmakuva_2024_5cm");
  });
});

test.describe("Curator mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Practice" }).click();
  });

  test("Curator mode", async ({ page }) => {
    // Try clicking set locations before setting locations
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole("button", { name: "Set locations" }).click();

    // Define positions on screen to click
    const clickPoints = [
      { x: 50, y: 50 },
      { x: 150, y: 150 },
      { x: 250, y: 250 },
      { x: 400, y: 300 },
      { x: 500, y: 550 },
    ];

    // Save clicked positions LatLngs to compare them to the LatLngs sent
    // from the submit daily form at the end of curator mode
    const expectedLatLngs = [];
    for (const point of clickPoints) {
      // Capture latlng before clicking
      const latLng = await page.evaluate(({ x, y }) => {
        // Handle map is undefined
        if (window.practiceMap === undefined) {
          throw new Error("Expected map to be defined");
        }
        // Get LatLngs of the clicks
        return window.practiceMap.containerPointToLatLng([x, y]);
      }, point);
      expectedLatLngs.push(latLng);
      await page.locator("#map").click({ position: point });
    }

    // Try clicking 6th location
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.locator("#map").click();

    // Continue to the zoom selection
    await page.getByText("Set locations").click();
    await page.getByRole("slider").fill("18");
    await page.getByText("Next").click();
    await page.getByRole("slider").fill("17");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("slider").fill("16");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("slider").fill("15");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("slider").fill("14");
    await page.getByRole("button", { name: "End" }).click();

    // Curator mode summary and submit daily form
    expect(page.getByText("Curator mode summary")).toBeVisible();
    expect(
      page.getByRole("heading", { name: "Select date for your daily" }),
    ).toBeVisible();
    // Try selecting a date for the daily challenge
    await page.locator("#date").fill("2026-01-01");
    const dateValue = await page.locator("#date").inputValue();
    expect(dateValue).toBe("2026-01-01");
    // Clicked locations on a summary map
    expect(page.getByText("Your daily challenge locations")).toBeVisible();

    // Get marker latlngs to compare against the clicks of the practice map
    const markerLatLngs = await page.evaluate(() => {
      // Handle map is undefined
      if (window.curatorMap === undefined) {
        throw new Error("Expected map to be defined");
      }
      const result: { lat: number; lng: number }[] = [];
      window.curatorMap.eachLayer((layer) => {
        if (layer instanceof window.L.Marker) {
          const ll = layer.getLatLng();
          result.push({ lat: ll.lat, lng: ll.lng });
        }
      });
      return result;
    });
    // Compare the markers to the clicks
    expect(markerLatLngs.length).toBe(expectedLatLngs.length);
    // Compare coordinates with tolerance
    expectedLatLngs.forEach((expected) => {
      const match = markerLatLngs.some(
        (actual) =>
          Math.abs(actual.lat - expected.lat) < 1e-6 &&
          Math.abs(actual.lng - expected.lng) < 1e-6,
      );
      expect(match).toBe(true);
    });

    // Submit the daily form and return to practice mode
    await page
      .getByRole("button", { name: "Submit your daily challenge" })
      .click();
    await expect(
      page.getByRole("button", { name: "1969 1997 2024" }),
    ).toBeVisible();
  });
});

test.describe("Game can be played in all cities and years", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "play" }).click();
  });

  test.describe("Correct ortolayer", () => {
    test.describe("Helsinki", () => {
      test("1943", async ({ page }) => {
        await page.getByText("1940's").click();
        const ortolayerName = await getWMSLayerName(page, "viewMap");
        expect(ortolayerName).toBe("avoindata:Ortoilmakuva_1943");
      });

      test("1969", async ({ page }) => {
        await page.getByText("1960's").click();
        const ortolayerName = await getWMSLayerName(page, "viewMap");
        expect(ortolayerName).toBe("avoindata:Ortoilmakuva_1969");
      });

      test("1997", async ({ page }) => {
        await page.getByText("1990's").click();
        const ortolayerName = await getWMSLayerName(page, "viewMap");
        expect(ortolayerName).toBe("avoindata:Ortoilmakuva_1997");
      });

      test("2024", async ({ page }) => {
        await page
          .locator("#year-selection")
          .getByRole("button", { name: "2020's" })
          .click();
        const ortolayerName = await getWMSLayerName(page, "viewMap");
        expect(ortolayerName).toBe("avoindata:Ortoilmakuva_2024_5cm");
      });
    });

    test.describe("Turku", () => {
      test("2022", async ({ page }) => {
        await page
          .locator("#turku")
          .getByRole("button", { name: "'s" })
          .click();
        const ortolayerName = await getWMSLayerName(page, "viewMap");
        expect(ortolayerName).toBe("Ilmakuva 2022 True ortho");
      });
    });
  });
});
