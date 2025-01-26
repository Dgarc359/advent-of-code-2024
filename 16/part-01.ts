import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
import { sleep } from "@/util/time";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

type DegreesToCoordinateVector = {
  // north
  0: { x: 1; y: -1 };

  // east
  90: { x: 1; y: 0 };

  // south
  180: { x: 0; y: 1 };

  // west
  270: { x: -1; y: 0 };
};

const DegreeToCardinal = {
  0: "north",
  90: "east",
  180: "south",
  270: "west",
} as const;

function turnDegreeClockwise90Degrees(
  deg: 0 | 90 | 180 | 270
): 0 | 90 | 180 | 270 {
  return ((deg + 90) % 360) as 0 | 90 | 180 | 270;
}

const input = fs.readFileSync("./input.txt").toString().split("\n");
const mapGrid = new GridContainer<string, undefined>(undefined);
const secondaryMapGrid = new GridContainer<Path, undefined>(undefined);

let startCoordinates: CoordinateXY = undefined!;
let endCoordinates: CoordinateXY = undefined!;

mapGrid.setHeight(input.length);
secondaryMapGrid.setHeight(input.length);
for (let y = 0; y < input.length; y++) {
  const xRow = input[y].split("");
  for (let x = 0; x < xRow.length; x++) {
    // we'll want to find the start and end coordinates
    const xChar = xRow[x];
    if (xChar === "S") {
      startCoordinates = { x, y };
    } else if (xChar === "E") {
      endCoordinates = { x, y };
    }
  }

  mapGrid.pushToGrid(xRow);
  mapGrid.setWidth(xRow.length);

  // Is this needed??
  secondaryMapGrid.pushToGrid(Array(xRow.length).fill("A"));
  secondaryMapGrid.setWidth(xRow.length);
}

type PathSource = "start" | "end";
class Path {
  currentCoord: CoordinateXY;
  currentCost: number;
  currentFacingDirection: 0 | 90 | 180 | 270;

  // directions will be an array
  // where the strings are colon delimited X:Y
  // to tell us how to reverse this path
  directions: string[];

  // the path can be starting
  pathSource: PathSource;

  constructor(
    coord: CoordinateXY,
    cost: number,
    currDir: 0 | 90 | 180 | 270,
    pathSource: PathSource = "start",
    sourcePath?: Path
  ) {
    this.currentCoord = coord;
    this.currentCost = cost;
    this.currentFacingDirection = currDir;
    this.pathSource = pathSource;
    if (sourcePath) {
      this.directions = [...sourcePath.directions];
    } else {
      this.directions = [];
    }

    this.addCoordToDirections(coord);
  }

  mapCurrentFacingDirToChar() {
    switch (this.currentFacingDirection) {
      case 0:
        return "^";
      case 90:
        return ">";
      case 180:
        return "v";
      case 270:
        return "<";
    }
  }

  logCurPath() {
    console.log(
      `curr cord x: ${this.currentCoord.x} y: ${
        this.currentCoord.y
      } dir: ${this.mapCurrentFacingDirToChar()}`
    );
  }

  addCoordToDirections(coord: CoordinateXY) {
    this.directions.push(`${coord.x}:${coord.y}`);
  }
}

const completedPathsArr: Path[] = [];

async function completePaths(
  currentCost: number,
  currentSteps: number, // may not be necessary
  currentCoordinate: CoordinateXY,
  currentFacingDirection: 0 | 90 | 180 | 270,
  mapGrid: GridContainer<string, undefined>,
  completedPaths: Path[],

  /** OPTIONAL */
  cheapestPath: number = Infinity
) {
  const tdcw = turnDegreeClockwise90Degrees;
  const currItem = mapGrid.getCoordGridItem(currentCoordinate);

  const currPathCost = new Path(
    currentCoordinate,
    currentCost,
    currentFacingDirection,
    "start"
  );

  const endPathCost = new Path(
    endCoordinates,
    currentCost,
    // turn the current facing direction 180
    tdcw(tdcw(currentFacingDirection)),
    "end"
  );

  const movementQueue = new Queue<Path>();
  addToQueue(movementQueue, currPathCost, mapGrid, completedPaths);
  addToQueue(movementQueue, endPathCost, mapGrid, completedPaths);

  let i = 0;
  while (movementQueue.size()) {
    const currPath = movementQueue.dequeue();
    if (
      currPath === undefined ||
      mapGrid.getCoordGridItem(currPath.currentCoord) === undefined ||
      mapGrid.getCoordGridItem(currPath.currentCoord)! === "X"
    )
      continue;

    // await sleep(1000);
    i++;
    // no turning around!!

    // if (i % 1000 === 0) {
    mapGrid.saveMapGridToFile("./checkpoint.txt");
    // }

    // traverse the thing

    // currPath.logCurPath();
    // mapGrid.logCurrentGrid();
    console.log(`iter: ${i}`);

    const cardinals = getAllCardinalCoordinates(currPath.currentCoord);
    // no cost to keep going in the same direction
    const currDir =
      cardinals[DegreeToCardinal[currPath.currentFacingDirection]];
    const straightPathCost = currPath.currentCost + 1;
    const straightPath = addToQueue(
      movementQueue,
      new Path(
        currDir,
        straightPathCost,
        currPath.currentFacingDirection,
        currPath.pathSource,
        currPath
      ),
      mapGrid,
      completedPaths
    );

    // if any path is not undefined, then we've found the end, going any other direction is weird.
    if (straightPath !== undefined) {
      continue;
    }

    const rightFacingDir = turnDegreeClockwise90Degrees(
      currPath.currentFacingDirection
    );
    const rightTurnCoord = cardinals[DegreeToCardinal[rightFacingDir]];
    const rightPathCost = currPath.currentCost + 1001;
    const rightPath = addToQueue(
      movementQueue,
      new Path(
        rightTurnCoord,
        rightPathCost,
        rightFacingDir,
        currPath.pathSource,
        currPath
      ),
      mapGrid,
      completedPaths
    );

    if (rightPath !== undefined) {
      continue;
    }

    // turn it 3 times... too sleepy to think of a better way to do this right now,
    // better than subtracting and maybe having to deal with negative numbers right now
    const leftFacingDir = tdcw(tdcw(tdcw(currPath.currentFacingDirection)));
    const leftTurnCoord = cardinals[DegreeToCardinal[leftFacingDir]];
    const leftPathCost = currPath.currentCost + 1001;
    const leftPath = addToQueue(
      movementQueue,
      new Path(
        leftTurnCoord,
        leftPathCost,
        leftFacingDir,
        currPath.pathSource,
        currPath
      ),
      mapGrid,
      completedPaths
    );

    if (leftPath !== undefined) {
      continue;
    }

    if (currPath.pathSource === "start") {
      mapGrid.setCoordGridItem(currPath.currentCoord, "X");
    } else {
      mapGrid.setCoordGridItem(currPath.currentCoord, "Z");
      secondaryMapGrid.setCoordGridItem(currPath.currentCoord, currPath);
    }
  }
}

function addToQueue(
  q: Queue<Path>,
  path: Path,
  mapGrid: GridContainer<string, undefined>,
  completedPaths: Path[]
) {
  const currItem = mapGrid.getCoordGridItem(path.currentCoord);

  if (
    path.pathSource === "start" &&
    (currItem === "E" ||
      (path.currentCoord.x === endCoordinates.x &&
        path.currentCoord.y === endCoordinates.y))
  ) {
    // we found the end, woohoo!
    console.log("we found the end!");
    completedPaths.push(path);
    return path;
  }

  if (currItem === undefined || currItem === "X" || currItem === "#") return;

  // Z will be what the end path assigns
  if (currItem === "Z" && path.pathSource !== "end") {
    const zGridPath: Path = secondaryMapGrid.getCoordGridItem(
      path.currentCoord
    )!;
    const newPath = new Path(
      path.currentCoord,
      zGridPath.currentCost + path.currentCost,
      path.currentFacingDirection,
      path.pathSource,
      path
    )
    completedPaths.push(
      newPath
    );
    return newPath
  } else {
    q.enqueue(path);
  }
}

function findCheapestPathFromCompletedPaths(completedPaths: Path[]) {
  let cheapest = undefined;

  for (const path of completedPaths) {
    if (cheapest === undefined) {
      cheapest = path;
      continue;
    }

    if (path.currentCost <= cheapest.currentCost) {
      cheapest = path;
    }
  }

  return cheapest;
}

/**
 *        0
 *        |
 * 270 -     - 90
 *        |
 *        180
 */

{
  (async () => {
    // we're doing some sleeps during the iteration for visualization purposes
    await completePaths(0, 0, startCoordinates, 90, mapGrid, completedPathsArr);

    const cheapestPath = findCheapestPathFromCompletedPaths(completedPathsArr);

    if (cheapestPath === undefined) {
      console.log("couldnt find a cheap path");
      return;
    }
    console.log(
      `finished pathing, cheapest path cost: ${cheapestPath.currentCost}`
    );
  })();
}
