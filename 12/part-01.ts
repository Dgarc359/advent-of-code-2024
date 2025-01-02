import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

const input = fs.readFileSync("./input.txt").toString();

class GridPlant {
  value: string;
  regionId: number = -1;
  isBorder: boolean = false;
  hasBeenAccounted: boolean = false;
  coordinate: CoordinateXY;

  constructor(value: string, coordinate: CoordinateXY) {
    this.value = value;
    this.coordinate = coordinate;
  }
}

class RegionIdentifier {
  regionIdx: number = 0;
  constructor(v: number) {
    this.regionIdx = v;
  }
}

const mapGrid = new GridContainer<GridPlant, undefined>(undefined);
const regionGrid = new GridContainer<RegionIdentifier, undefined>(undefined);

const yRows = input.toString().split("\n");

mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  mapGrid.pushToGrid(xRow.map((v, x) => new GridPlant(v, { x, y })));
  mapGrid.setWidth(xRow.length);
}

class RegionIndexer {
  value: number = 0;
  // returns the next regionIdx
  incrementRegionIdx(): number {
    this.value++;

    return this.value;
  }
}

regionGrid.setHeight(mapGrid.getHeight());
regionGrid.setWidth(mapGrid.getWidth());

for (let y = 0; y < regionGrid.getHeight(); y++) {
  regionGrid.pushToGrid(
    Array(regionGrid.getHeight()).fill(new RegionIdentifier(-1))
  );
}
// regionGrid.pushToGrid(
//   Array(regionGrid.getHeight()).fill(
//     Array(regionGrid.getWidth()).fill(new RegionIdentifier(-1))
//   )
// );

const regionIdx = new RegionIndexer();

type RegionSize = number;
type RegionPerimeter = number;
type RegionCounterMapValue = {
  regionSize: RegionSize;
  regionPerimeter: RegionPerimeter;
};

const regionCounterMap = new Map<number, RegionCounterMapValue>();

for (let y = 0; y < mapGrid.getHeight(); y++) {
  for (let x = 0; x < mapGrid.getWidth(); x++) {
    const regionIdentifier = regionGrid.getCoordGridItem({ x, y });

    // we've already assigned a region to this coordinate.
    if (regionIdentifier!.regionIdx !== -1) continue;

    const regionId = regionIdx.incrementRegionIdx();

    regionCounterMap.set(regionId, { regionSize: 0, regionPerimeter: 0 });

    const mapPlant = mapGrid.getCoordGridItem({ x, y });

    if (!mapPlant) throw new Error("We should havea map plant here");
    const q = new Queue<GridPlant>();

    addToQueue(
      q,
      mapPlant.value,
      mapPlant,
      regionId,
      regionGrid,
      regionCounterMap
    );

    while (q.size()) {
      const plant = q.dequeue();

      const cardinals = getAllCardinalCoordinatesIter(
        plant!.coordinate
      ).flatMap((coord) => mapGrid.getCoordGridItem(coord) );
      for (const cardinal of cardinals) {
        addToQueue(
          q,
          mapPlant.value,
          cardinal,
          regionId,
          regionGrid,
          regionCounterMap
        );
      }
    }
  }
}

function addToQueue(
  q: Queue<GridPlant>,
  plantType: string,
  gridPlant: GridPlant | undefined,
  currentRegion: number,
  regionTileMap: GridContainer<RegionIdentifier, undefined>,
  regionCounterMap: Map<number, RegionCounterMapValue>
) {
  const currRegionCounterMapVal = regionCounterMap.get(currentRegion);
  if(!gridPlant) {
    // we're out of bounds, add +1 to perimeter and thats it
    regionCounterMap.set(currentRegion, {
      regionSize: currRegionCounterMapVal!.regionSize,
      regionPerimeter: (currRegionCounterMapVal!.regionPerimeter ?? 0) + 1,
    });
    return;
  }
  const regionPlant = regionTileMap.getCoordGridItem(gridPlant.coordinate);

  if (gridPlant.value === plantType && regionPlant!.regionIdx === -1) {
    regionTileMap.setCoordGridItem(
      gridPlant.coordinate,
      new RegionIdentifier(currentRegion)
    );
    q.enqueue(gridPlant);

    regionCounterMap.set(currentRegion, {
      regionSize: (currRegionCounterMapVal!.regionSize ?? 0) + 1,
      regionPerimeter: currRegionCounterMapVal!.regionPerimeter,
    });
  } else if (gridPlant.value !== plantType) {
    regionCounterMap.set(currentRegion, {
      regionSize: currRegionCounterMapVal!.regionSize,
      regionPerimeter: (currRegionCounterMapVal!.regionPerimeter ?? 0) + 1,
    });
  }
}

let sum = 0;

for (const [region, regionCount] of regionCounterMap.entries()) {
  sum += regionCount.regionSize * regionCount.regionPerimeter;
}

console.log(
  "we were supposed to have some type of answer here... still working on that",
  // regionMap,
  // mapGrid,
  sum
);
