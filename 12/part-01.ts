import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

const input = fs.readFileSync("./input-03.txt").toString();

type GridPlant = {
  value: string;
  regionId: string;
  isBorder: boolean;
  hasBeenAccounted: boolean;
};

const mapGrid = new GridContainer<GridPlant, undefined>(undefined);

const plantIndex = new Map<string, CoordinateXY[]>();

const yRows = input.toString().split("\n");

mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  for (let x = 0; x < xRow.length; x++) {
    const plant = xRow[x];

    const plantIndexVal = plantIndex.get(plant);
    plantIndex.set(plant, [...(plantIndexVal ?? []), { x, y }]);
  }

  mapGrid.pushToGrid(
    xRow.map((v) => {
      return {
        value: v,
        regionId: `${v}:-1`,
        isBorder: false,
        hasBeenAccounted: false,
      };
    })
  );
  mapGrid.setWidth(xRow.length);
}

type RegionMapVal = { area: number; perimeter: number };
const regionMap = new Map<string, { area: number; perimeter: number }>();
let regionExpanded = false;
do {
  for (const [plantType, coordinateList] of plantIndex.entries()) {
    regionExpanded = false;
    let regionIdx = 0;
    // items that are sequential in the array will more than likely share a border,
    // since they are likely be geographically close, because of the
    // indexing logic used
    for (const coordinate of coordinateList) {
      const plantItem = mapGrid.getGridItem(coordinate.x, coordinate.y);
      if (!plantItem) throw new Error("Something went wrong with our indexing");

      const emptyRegionId = `${plantType}:-1`;
      let regionId = `${plantType}:${regionIdx}`;

      if (plantItem.regionId.split(":")[1] === "-1") {
        plantItem.regionId = regionId;

        mapGrid.setGridItem(coordinate.x, coordinate.y, plantItem);
        regionIdx++;
      } else {
        regionId = plantItem.regionId;
      }

      const oldRegionMapVal = regionMap.get(regionId);

      const emptyRegionMapVal: RegionMapVal = { area: 1, perimeter: 4 };

      // exclude switching north and west tiles, we'll switch tiles east and south
      const cardinalCoords = getAllCardinalCoordinatesIter(coordinate, [
        "north",
        "west",
      ]);

      let isBorder = false;

      for (const cardinalCoord of cardinalCoords) {
        const item = mapGrid.getCoordGridItem(cardinalCoord);
        if (!item) continue;

        if (item.value !== plantType) continue;
        if (item.regionId !== emptyRegionId) continue;

        const newItem: GridPlant = {
          value: item.value,
          regionId,
          isBorder: false,
          hasBeenAccounted: false,
        };

        mapGrid.setCoordGridItem(cardinalCoord, newItem);

        regionExpanded = true;
      }

      const borderCheckCoords = getAllCardinalCoordinatesIter(coordinate);

      for (const borderCheckCoord of borderCheckCoords) {
        const item = mapGrid.getCoordGridItem(borderCheckCoord);
        if (!item) continue;

        if (item.regionId !== regionId) {
          isBorder = true;
        } else {
          emptyRegionMapVal.perimeter -= 1;
        }
      }

      const oldMapGridItem = mapGrid.getCoordGridItem(coordinate);

      if(oldMapGridItem && !oldMapGridItem.hasBeenAccounted) {
        if (oldRegionMapVal) {
          emptyRegionMapVal.area += oldRegionMapVal.area;
          emptyRegionMapVal.perimeter += oldRegionMapVal.perimeter;
        }

        regionMap.set(regionId, emptyRegionMapVal);
      }

      mapGrid.setCoordGridItem(coordinate, {
        ...mapGrid.getCoordGridItem(coordinate)!,
        isBorder,
        hasBeenAccounted: true,
      });
    }
    // regionExpanded will have some conditions that can set this to true and
    // rerun all the logic in the do while until the region is fully expanded
  }
} while (regionExpanded);

// a piece of a region that is on the border will have at least 1 piece
// in its cardinal coordinates that is not in the same region as itself.

let sum = 0;

for(const [key, val] of regionMap) {
  sum += val.area * val.perimeter;
}

console.log(
  "we were supposed to have some type of answer here... still working on that",
  // regionMap,
  // mapGrid,
  sum,
);
