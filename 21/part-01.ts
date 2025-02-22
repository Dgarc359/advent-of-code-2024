import fs from "node:fs";
// if you have read the puzzle input for this day... lol...

import { GridContainer } from "@/util/grid-container";
import { Node } from "@/util/index";
import { Queue } from "@/util/queue";
import { CoordinateXY } from "@/util/types";
import { getAllCardinalCoordinatesIterWithOffset } from "@/util/grid-util";

// overall goal:
// find the shortest path between a bunch of different nodes
// the shortest path we find needs to go through a few translation layers
// before we have the sequence of keypresses / movements that will yield our
// shortest path

// steps
// find shortest path
// turn path into directional instructions
// run directional instructions through translation layer for
// robots to give instructions to robots to give instructions to robots

// some initial thoughts:
// there's only going to be so many shortest paths for the directional
// input

// but each input will have their own computable shortest paths between
// different tiles on the grid.
// they have a shared requirement to cache some of their results
// because we shouldnt be recomputing shortest paths we've already
// computed. It will waste cycles

// side note. Shortest path on the keypads is gonna be L shaped pathing
// but it does look like we need to avoid pathing over the undefined keys
// on the key pads

type Numpad = GridContainer<Node, undefined>;
const numpad: Numpad = new GridContainer<Node, undefined>(undefined);

const numpadValues = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [undefined, "0", "A"],
];

numpad.setHeight(numpadValues.length);
for (let y = 0; y < numpadValues.length; y++) {
  const row = numpadValues[y];
  numpad.setWidth(row.length);
  numpad.pushToGrid(row.map((v, x) => new Node(v, { x, y })));

  for (let x = 0; x < row.length; x++) {
    numpad.indexItem(row[x], { x, y });
  }
}

type DirectionalKeypad = GridContainer<Node, undefined>

const directionalKeypad: DirectionalKeypad = new GridContainer<Node, undefined>(undefined);

const directionalKeypadValues = [
  [undefined, "^", "A"],
  ["<", "v", ">"],
];

directionalKeypad.setHeight(directionalKeypadValues.length);
for (let y = 0; y < directionalKeypadValues.length; y++) {
  const row = directionalKeypadValues[y];
  directionalKeypad.setWidth(row.length);
  for (let x = 0; x < row.length; x++) {
    directionalKeypad.setCoordGridItem(
      { x, y },
      new Node(row[x], { x, y }),
      row[x]
    );
  }
}

const input = fs.readFileSync("./input-01.txt").toString().split("\n");

function findLowestCostNodeInQueue(q: Queue<Node>): [Node, number] {
  let lowestCostNode: Node = undefined!;
  let lowestCostIdx: number = undefined!;

  q.forEach((node, i) => {
    if (lowestCostNode === undefined) {
      lowestCostNode = node;
      lowestCostIdx = i;
      return;
    }

    if (node.cost <= lowestCostNode.cost) {
      lowestCostNode = node;
      lowestCostIdx = i;
      return;
    }
  });

  return [q.dequeue(lowestCostIdx)!, lowestCostIdx];
}

function coordIsStillInQueue(coord: CoordinateXY, q: Queue<Node>): boolean {
  let isStillInQueue = false;

  q.forEach((node) => {
    if (node.coord.x === coord.x && node.coord.y === coord.y) {
      isStillInQueue = true;
    }
  });

  return isStillInQueue;
}

function getNodeFromQueue(coord: CoordinateXY, q: Queue<Node>): [Node, number] {
  let targetNode: Node = undefined!;
  let targetIdx: number = undefined!;

  q.forEach((node, i) => {
    if (node.coord.x === coord.x && node.coord.y === coord.y) {
      targetNode = node;
      targetIdx = i;
    }
  });

  return [targetNode, targetIdx];
}


function getPrecomputedShortestPath(startingNode: Node, targetNode: Node, cache: Map<string, Node>) {
  const mapKey = `${startingNode.coord.x},${startingNode.coord.y},${targetNode.coord.x},${targetNode.coord.y}`;
  return cache.get(mapKey)
}


// this is modified from day 20
// name, removing requiring passing a Queue object
// For the reason that usage of this function should not rely on external
// knowledge that a Queue is required for this algorithm to work.
// consumer shouldn't worry about what data structure or algorithm is used to find
// the shortest path

// I _DO_ want to add the ability to pass some kind of cache or memo
// so that we can avoid recomputing paths we've already computed
function findShortestPath(
  startingNode: Node,
  targetNode: Node,
  mapGrid: GridContainer<Node, undefined>,
  cache: Map<string, Node>
) {

  const precomputedPath = getPrecomputedShortestPath(startingNode, targetNode, cache)
  
  if (precomputedPath) {
    return precomputedPath;
  }

  // create a copy of whatever grid container is being used to avoid side effects
  const map = new GridContainer<Node, undefined>(undefined).fromGridContainer(mapGrid);

  const grid = map.getInnerGrid().flat()
  .filter((node) => {
    if (node.value === undefined) {
      return false
    }

    if (node.value === startingNode.value) {
      return false;
    }
    return true
  })
  const q = new Queue<Node>([startingNode, ...grid]);

  while (q.size()) {
    const [currentNode, nodeIdx] = findLowestCostNodeInQueue(q);

    if (currentNode === undefined || nodeIdx === undefined) {
      throw new Error("We had an issue finding a lowest value node");
    }

    if (currentNode.value === undefined) {
      // just skip nodes with undefined as the value
      continue;
    }

    if (currentNode.coord.x === targetNode.coord.x && currentNode.coord.y === targetNode.coord.y) {
      console.log("WE FOUND DA END AGAIN, path cost:", currentNode.getCost());
      return currentNode;
    }

    const cardinalCoordinates = getAllCardinalCoordinatesIterWithOffset(
      currentNode.coord
    );
    const cardinalsStillInQueue = cardinalCoordinates.filter((coord) =>
      coordIsStillInQueue(coord, q)
    );

    for (const cardinal of cardinalsStillInQueue) {
      const calculatedCostForMoveToCardinal = currentNode.cost + 1;
      const [node, cardinalIdx] = getNodeFromQueue(cardinal, q);
      if (node.value === "#") {
        continue;
      }

      if (calculatedCostForMoveToCardinal < node.cost) {
        node.setCost(calculatedCostForMoveToCardinal);
        node.setPrevious(currentNode);

        q.replace(cardinalIdx, node);
      }
    }

    map.setCoordGridItem(currentNode.coord, currentNode);
  }
}

function addShortestPathToCache(
  startingNode: Node,
  targetNode: Node,
  shortestPath: Node,
  cache: Map<string, Node>
) {
  const mapKey = `${startingNode.coord.x},${startingNode.coord.y},${targetNode.coord.x},${targetNode.coord.y}`;
  cache.set(mapKey, shortestPath);
}

function getDirectionalInstruction(
  startingNode: Node,
  targetNode: Node,
): string {
  if (targetNode.coord.y < startingNode.coord.y) {
    return "v"
  } else if (targetNode.coord.y > startingNode.coord.y) {
    return "^"
  }

  if (targetNode.coord.x < startingNode.coord.x) {
    return "<"
  } else if (targetNode.coord.x > startingNode.coord.x) {
    return ">"
  }

  throw new Error("We couldn't find a direction to move in")
}


function constructPathFromNode(node: Node): string[] {
  const path: string[] = [];

  let currentNode: Node = node;

  while (currentNode.getPrevious()) {
    path.push(getDirectionalInstruction(currentNode.getPrevious(), currentNode));
    currentNode = currentNode.getPrevious();
  }

  return path.reverse();
}


function getShortestPathToCurrentInstruction(
  startingInstruction: string,
  targetInstruction: string,
  grid: GridContainer<Node, undefined>,
  cache: Map<string, Node>
) {
  const startingIdx = grid.indexOf(startingInstruction);
  const targetIdx = grid.indexOf(targetInstruction);

  if (!startingIdx || !targetIdx) {
    throw new Error(`trying to target an untargettable instruction ${startingInstruction} ${targetInstruction}`)
  }

  const startingNode = grid.getCoordGridItem(startingIdx!)
  const targetNode = grid.getCoordGridItem(targetIdx!)

  if (!startingNode || !targetNode) {
    throw new Error("trying to target an untargettable instruction")
  }

  // now find shortest path, remember to avoid undefined values for the path
  // ENTIRELY

  const shortestCostNode = findShortestPath(startingNode, targetNode, grid, cache)

  if(shortestCostNode === undefined) {
    throw new Error("We couldn't find a shortest path. We should be able to do that")
  }

  addShortestPathToCache(startingNode, targetNode, shortestCostNode, cache)

  return constructPathFromNode(shortestCostNode);
}

function getButtonPresses(
  instructions: string[],
  numpad: GridContainer<Node, undefined>,
  directionalKeypad: GridContainer<Node, undefined>
): string[] {
  const buttonPresses: string[] = []

  let previousInstruction: string = undefined!;

  const numpadPathCache = new Map<string, Node>();
  const directionalKeypadPathCache = new Map<string, Node>();

  for (const instruction of instructions) {
    if (!previousInstruction) {
      previousInstruction = "A";
    }

    // this path should be for the initial ROBOT
    const shortestPathToCurrentInstruction =
      getShortestPathToCurrentInstruction(
        previousInstruction,
        instruction,
        numpad,
        numpadPathCache
      );

    // this robot is being controlled to press the initial path buttons
    const instructionsToInputShortestPath = "";

    // this robot is being controlled to press the initial path buttons
    const instructionsToInputInstructionsToInputShortestPath = "";

    // we're going to push in 'instructions to input instruction to input shortest path'
    // into the buttonpresses array
    buttonPresses.push()
  }

  return buttonPresses;
}

// TODO: finish this function after completing get button presses
function getComplexity(
  instructionString: string,
  buttonPresses: string[]
): number {
  return 0;
}

let complexitySum = 0;

for (const instructionString of input) {
  const instructions = instructionString.split("");

  const buttonPresses = getButtonPresses(
    instructions,
    numpad,
    directionalKeypad
  );

  const complexity = getComplexity(instructionString, buttonPresses);

  complexitySum += complexity;
}

console.log("P1 - The sum of all the complexities is:", complexitySum);
