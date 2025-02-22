import fs from "node:fs";
// if you have read the puzzle input for this day... lol...

import { GridContainer } from "@/util/grid-container";
import { Node } from "@/util/index";
import { Queue } from "@/util/queue";

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

const keypad = new GridContainer<Node, undefined>(undefined);

const keypadValues = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [undefined, "0", "A"],
];

keypad.setHeight(keypadValues.length);
for (let y = 0; y < keypadValues.length; y++) {
  const row = keypadValues[y];
  keypad.setWidth(row.length);
  for (let x = 0; x < row.length; x++) {
    keypad.setCoordGridItem({ x, y }, new Node(row[x], { x, y }), row[x]);
  }
}

const directionalKeypad = new GridContainer<Node, undefined>(undefined);

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

function getShortestPathToCurrentInstruction(
  startingInstruction: string,
  targetInstruction: string,
  grid: GridContainer<Node, undefined>
) {
  if(!grid.indexOf(startingInstruction) || !grid.indexOf(targetInstruction)) {
    throw new Error("trying to target an untargettable instruction")
  }

  const startingNode = grid.getCoordGridItem(grid.indexOf(startingInstruction)!)
  const targetNode = grid.getCoordGridItem(grid.indexOf(targetInstruction)!)

  // now find shortest path, remember to avoid undefined values for the path
  // ENTIRELY

}

function getButtonPresses(
  instructions: string[],
  keypad: GridContainer<Node, undefined>,
  directionalKeypad: GridContainer<Node, undefined>
): string[] {
  const buttonPresses: string[] = []

  let previousInstruction: string = undefined!;

  for (const instruction of instructions) {
    if (!previousInstruction) {
      previousInstruction = instruction;
      continue;
    }

    // this path should be for the initial ROBOT
    const shortestPathToCurrentInstruction =
      getShortestPathToCurrentInstruction(
        previousInstruction,
        instruction,
        keypad
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
    keypad,
    directionalKeypad
  );

  const complexity = getComplexity(instructionString, buttonPresses);

  complexitySum += complexity;
}

console.log("P1 - The sum of all the complexities is:", complexitySum);
