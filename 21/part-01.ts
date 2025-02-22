import fs from "node:fs";
// if you have read the puzzle input for this day... lol...

import { GridContainer } from "@/util/grid-container";
import { Node } from "@/util/index";
import { Queue } from "@/util/queue";
import { CoordinateXY } from "@/util/types";
import { getAllCardinalCoordinatesIterWithOffset } from "@/util/grid-util";
import { assert } from "node:console";

const input = fs.readFileSync("./input-02.txt").toString().split("\n");
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
  directionalKeypad.pushToGrid(row.map((v, x) => new Node(v, { x, y })));
  for (let x = 0; x < row.length; x++) {
    directionalKeypad.indexItem(row[x], { x, y });
  }
}


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
  const cacheKey = generateCacheKey(startingNode, targetNode);
  return cache.get(cacheKey)
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

  // // create a copy of whatever grid container is being used to avoid side effects
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

    assert(currentNode.value !== undefined, "We should never have a node with an undefined value in the queue")

    if (currentNode.coord.x === targetNode.coord.x && currentNode.coord.y === targetNode.coord.y) {
      // console.log("WE FOUND DA END AGAIN, path cost:", currentNode.getCost());
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

  // return map.getCoordGridItem(targetNode.coord);
}

function generateCacheKey(a: Node, b: Node) {
  // let smallerNode: Node = undefined!
  // let biggerNode: Node = undefined!
  // if (a.coord.x < b.coord.x) {
  //   smallerNode = a;
  //   biggerNode = b;
  // } else {
  //   smallerNode = b;
  //   biggerNode = a;
  // }

  return `${a.value}::${b.value}`;
}

function addShortestPathToCache(
  startingNode: Node,
  targetNode: Node,
  shortestPath: Node,
  cache: Map<string, Node>
) {
  const cacheKey = generateCacheKey(startingNode, targetNode);
  cache.set(cacheKey, shortestPath);
}

function getDirectionalInstruction(
  startingNode: Node,
  targetNode: Node,
): string {
  if (targetNode.coord.y < startingNode.coord.y) {
    return "^"
  } else if (targetNode.coord.y > startingNode.coord.y) {
    return "v"
  }

  if (targetNode.coord.x < startingNode.coord.x) {
    return "<"
  } else if (targetNode.coord.x > startingNode.coord.x) {
    return ">"
  }

  throw new Error("We couldn't find a direction to move in")
}


function constructPathFromNode(node: Node): string[] {
  // we want A to be our last instruction for a specific path
  const path: string[] = ["A"];

  let currentNode: Node = node;

  while (currentNode.getPrevious()) {
    const directionalInstruction = getDirectionalInstruction(currentNode.getPrevious(), currentNode)

    path.push(directionalInstruction);
    currentNode = currentNode.getPrevious();
  }

  return path.reverse();
}



// workaround since our 'fromGridContainer' method doesn't give us a deep copy
function resetNodesInGrid(grid: GridContainer<Node, undefined>) {
  grid.setInnerGrid(grid.getInnerGrid().map((row) => {
    return row.map((node) => {
      const newNode = new Node(node.value, node.coord)
      return newNode;
    })
  }))
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
  startingNode.setCost(0)

  // now find shortest path, remember to avoid undefined values for the path
  // ENTIRELY

  const shortestCostNode = findShortestPath(startingNode, targetNode, grid, cache)

  if (shortestCostNode === undefined) {
    throw new Error("We couldn't find a shortest path. We should be able to do that")
  }

  addShortestPathToCache(startingNode, targetNode, shortestCostNode, cache)

  return constructPathFromNode(shortestCostNode);
}

function getButtonPresses(
  instructions: string[],
  numpad: GridContainer<Node, undefined>,
  directionalKeypad: GridContainer<Node, undefined>
): string {
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

    // reset costs after we've found the shortest path
    resetNodesInGrid(numpad)

    let previousInstructionInput: string = undefined!;
    // this robot is being controlled to press the initial path buttons
    const instructionsToInputShortestPath = shortestPathToCurrentInstruction.flatMap((currInstruction, i, arr) => {
      if (!previousInstructionInput) {
        previousInstructionInput = "A";
      }

      const path = getShortestPathToCurrentInstruction(
        previousInstructionInput,
        currInstruction,
        directionalKeypad,
        directionalKeypadPathCache
      );

      resetNodesInGrid(directionalKeypad)

      previousInstructionInput = currInstruction

      return path
    });

    // these names are confusing but whatever... I dont want to shadow the other previous instructions
    let previousInstructionInputTimesTwo: string = undefined!;
    // this robot is being controlled to press the initial path buttons
    const instructionsToInputInstructionsToInputShortestPath = instructionsToInputShortestPath.flatMap((currInstruction, i, arr) => {
      if (!previousInstructionInputTimesTwo) {
        previousInstructionInputTimesTwo = "A";
      }

      const path = getShortestPathToCurrentInstruction(
        previousInstructionInputTimesTwo,
        currInstruction,
        directionalKeypad,
        directionalKeypadPathCache
      );

      resetNodesInGrid(directionalKeypad)

      previousInstructionInputTimesTwo = currInstruction

      return path
    });
    resetNodesInGrid(directionalKeypad)

    // we're going to push in 'instructions to input instruction to input shortest path'
    // into the buttonpresses array
    buttonPresses.push(instructionsToInputInstructionsToInputShortestPath.join(""))

    previousInstruction = instruction
  }

  return buttonPresses.join("");
}

// TODO: finish this function after completing get button presses
function getComplexity(
  instructionString: string,
  buttonPresses: string
): number {
  const instructionNum = Number(instructionString.split("A")[0]).valueOf();
  const length = buttonPresses.length
  return length * instructionNum
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
