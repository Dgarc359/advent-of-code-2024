import fs from "node:fs";
// if you have read the puzzle input for this day... lol...

import { GridContainer } from "@/util/grid-container";
import { Node } from "@/util/index";
import { Queue } from "@/util/queue";
import { Cardinals, CoordinateXY } from "@/util/types";
import { getAllCardinalCoordinates, getAllCardinalCoordinatesIterWithOffset } from "@/util/grid-util";
import { assert } from "node:console";

class DirectionalNode extends Node {
  direction: DirectionVector = undefined!;
  constructor(v: any, coord: CoordinateXY) {
    super(v, coord);
  }

  getPrevious() {
    return super.getPrevious() as DirectionalNode;
  }
  setDirection(direction: DirectionVector) {
    this.direction = direction;
  }
  getDirection() {
    return this.direction;
  }
}

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

type Numpad = GridContainer<DirectionalNode, undefined>;
const numpad: Numpad = new GridContainer<DirectionalNode, undefined>(undefined);

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
  numpad.pushToGrid(row.map((v, x) => new DirectionalNode(v, { x, y })));

  for (let x = 0; x < row.length; x++) {
    numpad.indexItem(row[x], { x, y });
  }
}

type DirectionalKeypad = GridContainer<DirectionalNode, undefined>

const directionalKeypad: DirectionalKeypad = new GridContainer<DirectionalNode, undefined>(undefined);

const directionalKeypadValues = [
  [undefined, "^", "A"],
  ["<", "v", ">"],
];

directionalKeypad.setHeight(directionalKeypadValues.length);
for (let y = 0; y < directionalKeypadValues.length; y++) {
  const row = directionalKeypadValues[y];
  directionalKeypad.setWidth(row.length);
  directionalKeypad.pushToGrid(row.map((v, x) => new DirectionalNode(v, { x, y })));
  for (let x = 0; x < row.length; x++) {
    directionalKeypad.indexItem(row[x], { x, y });
  }
}


function getPrecomputedShortestPath(startingNode: DirectionalNode, targetNode: DirectionalNode, cache: Map<string, DirectionalNode>) {
  const cacheKey = generateCacheKey(startingNode, targetNode);
  return cache.get(cacheKey)
}


class DirectionVector {
  private direction: Cardinals;

  constructor(direction?: Cardinals) {
    this.direction = direction!;
  }

  setDirection(direction: Cardinals) {
    this.direction = direction;
  }

  getDirection() {
    return this.direction;
  }


  // TODO: give option to map values to 'direction'
}

function getCardinalDirectionBetweenTwoNodes(
  sourceNode: DirectionalNode,
  targetNode: DirectionalNode,
): Cardinals {
  if (targetNode.coord.y < sourceNode.coord.y) {
    return "north";
  } else if (targetNode.coord.y > sourceNode.coord.y) {
    return "south";
  }

  if (targetNode.coord.x < sourceNode.coord.x) {
    return "west";
  } else if (targetNode.coord.x > sourceNode.coord.x) {
    return "east";
  }

  throw new Error("We couldn't find a direction to move in");


}


function calculateVariableCostOfMovingToCardinal(
  currentNode: DirectionalNode,
  targetNode: DirectionalNode
) {
  const directionBetweenNodes = getCardinalDirectionBetweenTwoNodes(currentNode, targetNode);

  if (!currentNode.getDirection() || directionBetweenNodes === currentNode.getDirection().getDirection()) {
    return 1;
  } else {
    return 2
  }

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
  startingNode: DirectionalNode,
  targetNode: DirectionalNode,
  mapGrid: GridContainer<DirectionalNode, undefined>,
  cache: Map<string, DirectionalNode>
) {

  const precomputedPath = getPrecomputedShortestPath(startingNode, targetNode, cache)

  if (precomputedPath) {
    return precomputedPath;
  }

  // // create a copy of whatever grid container is being used to avoid side effects
  const map = new GridContainer<DirectionalNode, undefined>(undefined).fromGridContainer(mapGrid);

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
  const q = new Queue<DirectionalNode>([startingNode]);

  while (q.size()) {
    const currentNode = q.dequeue();

    if (currentNode === undefined) {
      throw new Error("We had an issue finding a lowest value node");
    }

    assert(currentNode.value !== undefined, "We should never have a node with an undefined value in the queue")

    const cardinalCoordinates = getAllCardinalCoordinatesIterWithOffset(currentNode.coord).map(coord => map.getCoordGridItem(coord)).filter(node => node !== undefined) as DirectionalNode[];

    // const cardinalCoords = getAllCardinalCoordinates(currentNode.coord);

    for (const cardinalNode of cardinalCoordinates) {
      if (cardinalNode.value === undefined) {
        continue;
      }

      const variableCostOfMoving  = calculateVariableCostOfMovingToCardinal(currentNode, cardinalNode);
      const calculatedCostForMoveToCardinal = currentNode.cost + variableCostOfMoving;

      if (calculatedCostForMoveToCardinal < targetNode.cost) {
        cardinalNode.setCost(calculatedCostForMoveToCardinal);
        cardinalNode.setPrevious(currentNode);
        const newDirection = new DirectionVector(getCardinalDirectionBetweenTwoNodes(currentNode, cardinalNode))
        cardinalNode.setDirection(newDirection)

        // q.replace(cardinalIdx, node);
        map.setCoordGridItem(cardinalNode.coord, cardinalNode);
        q.enqueue(cardinalNode);
      }
    }

    map.setCoordGridItem(currentNode.coord, currentNode);
  }
}

function generateCacheKey(a: DirectionalNode, b: DirectionalNode) {
  return `${a.value}::${b.value}`;
}

function addShortestPathToCache(
  startingNode: DirectionalNode,
  targetNode: DirectionalNode,
  shortestPath: DirectionalNode,
  cache: Map<string, DirectionalNode>
) {
  const cacheKey = generateCacheKey(startingNode, targetNode);
  cache.set(cacheKey, shortestPath);
}

function getDirectionalInstruction(
  startingNode: DirectionalNode,
  targetNode: DirectionalNode,
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


function constructPathFromNode(node: DirectionalNode): string[] {
  // we want A to be our last instruction for a specific path
  const path: string[] = ["A"];

  let currentNode: DirectionalNode = node;

  while (currentNode.getPrevious()) {
    const directionalInstruction = getDirectionalInstruction(currentNode.getPrevious(), currentNode)

    path.push(directionalInstruction);
    currentNode = currentNode.getPrevious();
  }

  return path.reverse();
}



// workaround since our 'fromGridContainer' method doesn't give us a deep copy
function resetNodesInGrid(grid: GridContainer<DirectionalNode, undefined>) {
  grid.setInnerGrid(grid.getInnerGrid().map((row) => {
    return row.map((node) => {
      const newNode = new DirectionalNode(node.value, node.coord)
      return newNode;
    })
  }))
}

function getShortestPathToCurrentInstruction(
  startingInstruction: string,
  targetInstruction: string,
  grid: GridContainer<DirectionalNode, undefined>,
  cache: Map<string, DirectionalNode>
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
  numpad: GridContainer<DirectionalNode, undefined>,
  directionalKeypad: GridContainer<DirectionalNode, undefined>
): string {
  const buttonPresses: string[] = []

  let previousInstruction: string = undefined!;

  const numpadPathCache = new Map<string, DirectionalNode>();
  const directionalKeypadPathCache = new Map<string, DirectionalNode>();

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
