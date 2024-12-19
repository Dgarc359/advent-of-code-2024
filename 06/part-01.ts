import fs from "node:fs";
import { GridContainer } from "@/util/grid-container";
import { Cardinals, CoordinateXY } from "@/util/types";

const map = fs.readFileSync("./input.txt").toString();

const mapGrid = new GridContainer<string, undefined>(undefined);

const yRows = map.split("\n");
let currGuardPos: CoordinateXY = undefined!;
let currGuardDirection: Cardinals = "north";

mapGrid.setHeight(yRows.length);
for (let y = 0; y < yRows.length; y++) {
  const xRow = yRows[y].split("");

  for (let x = 0; x < xRow.length; x++) {
    const tile = xRow[x];

    if (tile === "^") {
      console.log(`found guard at y: ${y} ${x}`);
      currGuardPos = { x, y };
      mapGrid.setGridItem(x, y, "X");
    }
  }

  mapGrid.pushToGrid(xRow);
  mapGrid.setWidth(xRow.length);
}

function decideNextGuardTile(
  currTile: CoordinateXY,
  currDirection: Cardinals,
  grid: GridContainer<string, undefined>
): { nextTileCoord: CoordinateXY, currentDirection: Cardinals } | undefined {
  let { x, y } = currTile;

  grid.setGridItem(x, y, "X");

  // first check to see if we need to change guard's direction
  let potentialX = x;
  let potentialY = y;

  if (currDirection === "north") potentialY -= 1;
  else if (currDirection === "south") potentialY += 1;
  else if (currDirection === "east") potentialX += 1;
  else if (currDirection === "west") potentialX -= 1;

  if (grid.getGridItem(potentialX, potentialY) === "#") {
    currDirection = setNextGuardDirection(currGuardDirection);
  }
  // after we've potentially changed his direction
  // then we can move on to moving the guard

  if (currDirection === "north") y -= 1;
  else if (currDirection === "south") y += 1;
  else if (currDirection === "east") x += 1;
  else if (currDirection === "west") x -= 1;

  if (!grid.getGridItem(x, y)) {
    return undefined;
  } else {
    const response = {
      nextTileCoord: { x, y },
      currentDirection: currDirection,
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

  currGuardPos = nextGuardTile.nextTileCoord;
  currGuardDirection = nextGuardTile.currentDirection;
} while (nextGuardTile);

let guardVisitCount = 0;
const innerMapGrid = mapGrid.getInnerGrid();
console.log("");
for (const yRow of innerMapGrid) {
  for (const xElem of yRow) {
    if (xElem === "X") {
      guardVisitCount += 1;
    }
  }
}
console.log(guardVisitCount);
