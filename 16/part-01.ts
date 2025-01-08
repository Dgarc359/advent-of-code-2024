import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
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

const input = fs.readFileSync("./input-01.txt").toString().split("\n");
const mapGrid = new GridContainer<string, undefined>(undefined);
const secondaryMapGrid = new GridContainer<string, undefined>(undefined);

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
  secondaryMapGrid.pushToGrid(xRow);
  secondaryMapGrid.setWidth(xRow.length);
}

class PathCost {
  currentCoord: CoordinateXY;
  currentCost: number;
  currentFacingDirection: 0 | 90 | 180 | 270;

  constructor(coord: CoordinateXY, cost: number, currDir: 0 | 90 | 180 | 270) {
    this.currentCoord = coord;
    this.currentCost = cost;
    this.currentFacingDirection = currDir;
  }
}

const completedPaths: PathCost[] = [];

function findCheapestPath(
  currentCost: number,
  currentSteps: number, // may not be necessary
  currentCoordinate: CoordinateXY,
  currentFacingDirection: 0 | 90 | 180 | 270,
  mapGrid: GridContainer<string, undefined>,
  completedPaths: PathCost[],

  /** OPTIONAL */
  cheapestPath: number = Infinity
) {
  const currItem = mapGrid.getCoordGridItem(currentCoordinate);
  // if (currItem === undefined || currItem === "X" || currItem === "#")
  //   return undefined;

  const currPathCost = new PathCost(
    currentCoordinate,
    currentCost,
    currentFacingDirection
  );

  // mapGrid.setCoordGridItem(currentCoordinate, "X");

  const movementQueue = new Queue<PathCost>();
  addToQueue(movementQueue, currPathCost, mapGrid, completedPaths);

  while (movementQueue.size()) {
    const currPath = movementQueue.dequeue();
    if (currPath === undefined) continue;

    const cardinals = getAllCardinalCoordinates(currPath.currentCoord);
    // no cost to keep going in the same direction
    const currDir = cardinals[DegreeToCardinal[currentFacingDirection]];
    addToQueue(
      movementQueue,
      new PathCost(currDir, currentCost + 1, currentFacingDirection),
      mapGrid,
      completedPaths
    );

    const rightFacingDir = turnDegreeClockwise90Degrees(currentFacingDirection);
    const rightTurnCoord = cardinals[DegreeToCardinal[rightFacingDir]];
    addToQueue(
      movementQueue,
      new PathCost(rightTurnCoord, currentCost + 1001, rightFacingDir),
      mapGrid,
      completedPaths
    )

    const tdcw = turnDegreeClockwise90Degrees;
    // turn it 3 times... too sleepy to think of a better way to do this right now,
    // better than subtracting and maybe having to deal with negative numbers right now
    const leftFacingDir = tdcw(tdcw(tdcw(currentFacingDirection)));
    const leftTurnCoord = cardinals[DegreeToCardinal[leftFacingDir]];
    addToQueue(
      movementQueue,
      new PathCost(leftTurnCoord, currentCost + 1001, leftFacingDir),
      mapGrid,
      completedPaths
    )

    // no turning around!!

    // traverse the thing
  }
}

function addToQueue(
  q: Queue<PathCost>,
  path: PathCost,
  mapGrid: GridContainer<string, undefined>,
  completedPaths: PathCost[]
) {
  const currItem = mapGrid.getCoordGridItem(path.currentCoord);

  if (currItem === "E" || path.currentCoord === endCoordinates) {
    // we found the end, woohoo!
    completedPaths.push(path)
    return;
  }
  if (currItem === undefined || currItem === "X" || currItem === "#") return;

  q.enqueue(path);
}

/**
 *        0
 *        |
 * 270 -     - 90
 *        |
 *        180
 */
const cheapestPath = findCheapestPath(0, 0, startCoordinates, 90, mapGrid, completedPaths);

console.log("finished pathing")