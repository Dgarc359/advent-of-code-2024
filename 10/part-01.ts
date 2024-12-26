import fs from "node:fs";
import { GridContainer } from "@/util/grid-container";
import { CoordinateXY } from "@/util/types";
import { getAllCardinalCoordinates } from "@/util/grid-util";

const file = fs.readFileSync("./input.txt");
const mapGrid = new GridContainer<number, undefined>(undefined);

const trailheadCoords: CoordinateXY[] = [];
const trailCountMap:  Map<string, number> = new Map();

const yRows = file.toString().split("\n");
mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  for (let x = 0; x < xRow.length; x++) {
    const tile = xRow[x];
    if(tile === '0') {
      // get coordinates for trailhead
      trailheadCoords.push({x, y})
    }
  }

  mapGrid.pushToGrid(xRow.map((e) => Number(e).valueOf()));
  mapGrid.setWidth(xRow.length);
}

console.log(JSON.stringify(trailheadCoords));


type TrailheadScore = number;
let totalScore = 0;

function followTrail(map: GridContainer<number, undefined>, startingCoord: CoordinateXY, score: TrailheadScore, originCoordinate: CoordinateXY): TrailheadScore {
  const currentTile = map.getGridItem(startingCoord.x, startingCoord.y);
  if(currentTile === undefined) return score;

  if(currentTile === 9) {
    const key = `${originCoordinate.x}-${originCoordinate.y}:${startingCoord.x}-${startingCoord.y}`
    trailCountMap.set(key,trailCountMap.get(key) ?? 0 + 1)
  };

  const cardinals = getAllCardinalCoordinates(startingCoord);

  if(map.getGridItem(cardinals.north.x, cardinals.north.y) === currentTile + 1) {
    score = followTrail(map, cardinals.north, score, originCoordinate);
  }

  if(map.getGridItem(cardinals.south.x, cardinals.south.y) === currentTile + 1) {
    score = followTrail(map, cardinals.south, score, originCoordinate);
  }

  if(map.getGridItem(cardinals.east.x, cardinals.east.y) === currentTile + 1) {
    score = followTrail(map, cardinals.east, score, originCoordinate);
  }

  if(map.getGridItem(cardinals.west.x, cardinals.west.y) === currentTile + 1) {
    score = followTrail(map, cardinals.west, score, originCoordinate);
  }

  // return followTrail(map, startingCoord, score)
  return score
}

for(const trailhead of trailheadCoords) {
  totalScore = followTrail(mapGrid, trailhead, totalScore, trailhead);
}

console.log('D10 P1:',totalScore);
console.log(trailCountMap.size);
// const score = followTrail(map, )
