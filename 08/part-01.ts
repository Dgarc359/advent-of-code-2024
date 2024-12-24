import fs from "node:fs";
import { GridContainer } from "@/util/grid-container";
import { CoordinateXY } from "@/util/types";
import {
  findSlopeOfTwoPoints,
  getNextCoordinateBasedOffSlope,
} from "@/util/math-util";

const file = fs.readFileSync("./input.txt");
const mapGrid = new GridContainer<string, undefined>(undefined);

const antennaCoordinates = new Map<string, CoordinateXY[]>();
const antinodeCoordinates = new Map<string, true>();

const yRows = file.toString().split("\n");
mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  for (let x = 0; x < xRow.length; x++) {
    const tile = xRow[x];
    if (tile !== ".") {
      antennaCoordinates.set(tile, [
        ...(antennaCoordinates.get(tile) ?? []),
        { x, y },
      ]);
    }
  }

  mapGrid.pushToGrid(xRow);
  mapGrid.setWidth(xRow.length);
}

function findAntinodeCoordinates(
  antennaKey: string,
  antennaCoords: CoordinateXY[]
) {
  if (antennaCoords.length === 0 || antennaCoords.length === 1) {
    return;
  }

  const p1 = antennaCoords[0];
  const p2 = antennaCoords[antennaCoords.length - 1];
  const slope = findSlopeOfTwoPoints(p1, p2);
  const positiveDeltaPoint = getNextCoordinateBasedOffSlope(
    p2,
    slope,
    "positive"
  );
  const negativeDeltaPoint = getNextCoordinateBasedOffSlope(
    p1,
    slope,
    "negative"
  );

  if (mapGrid.getGridItem(positiveDeltaPoint.x, positiveDeltaPoint.y)) {
    antinodeCoordinates.set(`${positiveDeltaPoint.x.toString()}:${positiveDeltaPoint.y.toString()}`, true);
  }

  if (mapGrid.getGridItem(negativeDeltaPoint.x, negativeDeltaPoint.y)) {
    antinodeCoordinates.set(`${negativeDeltaPoint.x.toString()}:${negativeDeltaPoint.y.toString()}`, true);
  }

  return findAntinodeCoordinates(antennaKey, antennaCoords.slice(0, -1));
}

for (const [antennaKey, antennaCoordList] of antennaCoordinates.entries()) {
  for (let i = 0; i < antennaCoordList.length; i++) {
    findAntinodeCoordinates(antennaKey, antennaCoordList.slice(i));
  }
}

// console.log(antennaCoordinates);

console.log("unique entries", antinodeCoordinates.size);
