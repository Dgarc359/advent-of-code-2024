import fs from "node:fs";
import { GridContainer } from "@/util/grid-container";
import { Cardinals } from "@/util/types";

const map = fs.readFileSync("./input.txt").toString();

//                      y,      x
type Coordinate = `${number}-${number}`;

const mapGrid = new GridContainer<string, undefined>(undefined);
// const obstacleIndex: Map<Coordinate, true> = new Map();

const yRows = map.split("\n");
let currGuardPos: Coordinate = undefined!;
let currGuardDirection: Cardinals = "north";

mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  for (let x = 0; x < xRow.length; x++) {
    const tile = xRow[x];

    if (tile === "^") {
      console.log(`found guard at y: ${y} ${x}`);
      currGuardPos = `${y}-${x}`;
      mapGrid.setGridItem(x, y, 'X')
    }
  }

  mapGrid.pushToGrid(xRow);
  mapGrid.setWidth(xRow.length);
}

function decideNextGuardTile(
  currTile: Coordinate,
  currDirection: Cardinals,
  grid: GridContainer<string, undefined>
): { nextTile: string; nextTileCoord: Coordinate } | undefined {
  // gives y, x coordinates
  let [y, x] = currTile.split("-").map((e) => Number(e).valueOf());
  grid.setGridItem(x, y, "X");

  if (currDirection === "north") y -= 1;
  else if (currDirection === "south") y += 1;
  else if (currDirection === "east") x += 1;
  else if (currDirection === "west") x -= 1;
  console.log(
    `new curr guard tile is x: ${x} y: ${y}, guard is facing: ${currDirection}`
  );

  if (!grid.getGridItem(x, y)) {
    console.log(
      `returning undefined, x: ${x}, y: ${y}, ${grid.getGridItem(x, y)}`
    );
    return undefined;
  } else {
    const response = {
      nextTile: grid.getGridItem(x, y)!,
      nextTileCoord: `${y}-${x}` as Coordinate,
    };

    return response;
  }
}

function setNextGuardDirection(currDirection: Cardinals): Cardinals {
  switch (currDirection) {
    case "east":
      return "south";
    case "south":
      return "west";
    case "west":
      return "north";
    case "north":
      return "east";
  }
}

let nextGuardTile = undefined;
do {
  nextGuardTile = decideNextGuardTile(
    currGuardPos,
    currGuardDirection,
    mapGrid
  );
  if (!nextGuardTile) break;
  console.log(`decided on next guard tile: ${JSON.stringify(nextGuardTile)}`);

  currGuardPos = nextGuardTile.nextTileCoord;

  if (nextGuardTile.nextTile === "#")
    currGuardDirection = setNextGuardDirection(currGuardDirection);
} while (nextGuardTile);

let guardVisitCount = 0;
for (const yRow of mapGrid.getInnerGrid()) {
  for (const xElem of yRow) {
    if (xElem === "X") {
      guardVisitCount += 1;
    }
  }
}
console.log(guardVisitCount);
