import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
import { sleep } from "@/util/time";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

type CardinalDegrees = 0 | 90 | 180 | 270;
class Node {
  // reference impl: https://en.wikipedia.org/wiki/Dijkstra's_algorithm#Algorithm
  // this should also basically be our 'cost' for the purpose of this
  // implementation
  distanceFromStartValue: number = Infinity;
  coord: CoordinateXY;
  previousNode?: Node;
  facingDir?: CardinalDegrees;

  constructor(coord: CoordinateXY) {
    this.coord = coord;
  }

  setDistance(n: number) {
    this.distanceFromStartValue = n;
  }

  getDistance() {
    return this.distanceFromStartValue;
  }

  setFacingDir(dir: CardinalDegrees) {
    this.facingDir = dir;
  }
  getFacingDir() {
    return this.facingDir;
  }

  setPreviousNode(node: Node) {
    this.previousNode = node;
  }
  getPreviousNode() {
    return this.previousNode;
  }
}

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
const unvisitedSet = new GridContainer<Node, undefined>(undefined);

let startCoordinates: CoordinateXY = undefined!;
let endCoordinates: CoordinateXY = undefined!;

const q = new Queue<Node>();
mapGrid.setHeight(input.length);
unvisitedSet.setHeight(input.length);
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

  const newXRow = Array(xRow.length)
    .fill(undefined)
    .map((v, x) => {
      const node = new Node({ x, y });
      return node;
    });

  unvisitedSet.pushToGrid(newXRow);
  unvisitedSet.setWidth(xRow.length);
}

async function traverseUnvisitedSet() {
  const tdcw = turnDegreeClockwise90Degrees;
  // const startingNode = unvisitedSet.getCoordGridItem(startCoordinates);
  const startingNode = unvisitedSet.getCoordGridItem(startCoordinates);
  if (!startingNode) {
    throw new Error("??? NO STARTING NODE");
  }

  // set starting node distance to 0
  startingNode.setDistance(0);
  startingNode.setFacingDir(90);
  unvisitedSet.setCoordGridItem(startCoordinates, startingNode);

  unvisitedSet.forEach((node) => {
    const mapGridVal = mapGrid.getCoordGridItem(node.coord)!;

    // don't queue up the walls... for visitation
    if (mapGridVal === "#") return;
    q.enqueue(node);
  });

  let i = 0;
  while (q.size()) {
    console.log(`iter: ${i}`);
    const currentNode = findLowestNodeDistanceCostInQueue(q);
    if (!currentNode) {
      throw Error("???");
    }

    if (
      currentNode.coord.x === endCoordinates.x &&
      currentNode.coord.y === endCoordinates.y
    ) {
      // we found the end...
      // reverse iteration to find the shortest path
      console.log("we found the exit gang");
      console.log(currentNode.getDistance())
      break;
    }

    if (currentNode.getFacingDir() === undefined) {
      throw new Error(
        "WE DID SOMETHING WRONG AND HAVE NO FACING DIR, BAD ORDER OF OPERATIONS"
      );
    }

    const cardinals = getAllCardinalCoordinates(currentNode.coord);

    // get straight ahead, which has no cost
    const straightDir =
      cardinals[
        DegreeToCardinal[currentNode.getFacingDir() as CardinalDegrees]
      ];
    doOperationOnCardinal(
      currentNode,
      straightDir,
      currentNode.getFacingDir() as CardinalDegrees,
      1,
      q
    );

    const rightFacingDegreeValue = tdcw(
      currentNode.getFacingDir() as CardinalDegrees
    );
    const rightDir = cardinals[DegreeToCardinal[rightFacingDegreeValue]];

    doOperationOnCardinal(
      currentNode,
      rightDir,
      rightFacingDegreeValue,
      1001,
      q
    );

    const leftDegreeVal = tdcw(
      tdcw(tdcw(currentNode.getFacingDir() as CardinalDegrees))
    );
    const leftDir = cardinals[DegreeToCardinal[leftDegreeVal]];
    doOperationOnCardinal(currentNode, leftDir, leftDegreeVal, 1001, q);

    i++;
    await sleep(10);
  }
}

function doOperationOnCardinal(
  currentNode: Node,
  coord: CoordinateXY,
  newFacingDir: CardinalDegrees,
  cost: number,
  q: Queue<Node>
) {
  // const node = unvisitedSet.getCoordGridItem(coord);
  const result = nodeIdxInQueue(coord, q);
  // check if node is actually in the queue and in unvisited set gridcontainer

  if (result.node === undefined || result.idx === undefined) {
    // result isn't in queue
    return;
  }

  const distanceCost = currentNode.getDistance() + cost;

  // if calculated distance cost in less than current cost of item in q
  // then edit the item in the queue
  if (distanceCost < result.node.getDistance()) {
    const newNode = new Node(coord);
    newNode.setFacingDir(newFacingDir);
    newNode.setDistance(distanceCost);
    newNode.setPreviousNode(currentNode);
    q.replace(result.idx, newNode);
  }

  // this is just to visualize what's going on
  mapGrid.setCoordGridItem(coord, "X");
  mapGrid.saveMapGridToFile("checkpoint.txt");
}

function nodeIdxInQueue(
  targetNode: CoordinateXY,
  q: Queue<Node>
): { idx?: number; node?: Node } {
  let isStillInQueue = undefined;
  let nodeInQueue = undefined;

  q.forEach((node, i) => {
    if (node.coord.x === targetNode.x && node.coord.y === targetNode.y) {
      isStillInQueue = i;
      nodeInQueue = node;
    }
  });

  return {
    idx: isStillInQueue,
    node: nodeInQueue,
  };
}

function findLowestNodeDistanceCostInQueue(q: Queue<Node>) {
  let lowest: Node = undefined!;
  let lowestIdx: number = undefined!;

  if (!q.size()) {
    return undefined;
  }

  q.forEach((node, i) => {
    if (lowest === undefined) {
      lowest = node;
      lowestIdx = i;
      return;
    }

    if (node.getDistance() <= lowest.getDistance()) {
      lowest = node;
      lowestIdx = i;
    }
  });

  return q.dequeue(lowestIdx);
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
    await traverseUnvisitedSet();
  })();
}
