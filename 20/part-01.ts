import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
  getAllCardinalCoordinatesIterWithOffset,
  getAllOrdinalCoordinates,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";
import chalk from "chalk";

const inputRows = fs.readFileSync("input.txt").toString().split("\n");

// simple node class for the grid
class Node {
  prev: Node = undefined!;
  cost: number = Infinity;
  coord: CoordinateXY;
  value: any;

  constructor(v: any, coord: CoordinateXY) {
    this.value = v;
    this.coord = coord;
  }
  setPrevious(n: Node) {
    this.prev = n;
  }
  getPrevious() {
    return this.prev;
  }

  setCost(c: number) {
    this.cost = c;
  }
  getCost() {
    return this.cost;
  }

  setValue(v: any) {
    this.value = v;
  }
  getValue() {
    return this.value;
  }

  setCoord(c: CoordinateXY) {
    this.coord = c;
  }
}

const q = new Queue<Node>();
const mapGrid = new GridContainer<Node, undefined>(undefined);
const startNode = new Node("S", { x: -1, y: -1 });
const endNode = new Node("E", { x: -1, y: -1 });

// create grid of starting nodes
// and queue up walkable nodes for finding shortest path
for (let y = 0; y < inputRows.length; y++) {
  console.log(inputRows[y]);
  const xRow = inputRows[y].split("");
  const nodeArr = [];

  for (let x = 0; x < xRow.length; x++) {
    const xRowVal = xRow[x];
    const coord = { x, y };
    const newNode = new Node(xRowVal, coord);

    if (xRowVal === "S") {
      startNode.setCoord(coord);
      newNode.setCost(0);
    } else if (xRowVal === "E") {
      endNode.setCoord(coord);
    }

    if (xRowVal === "S" || xRowVal === "E" || xRowVal === ".") {
      q.enqueue(newNode);
    }

    nodeArr.push(newNode);
  }

  mapGrid.pushToGrid(nodeArr);

  mapGrid.setWidth(xRow.length);
}

mapGrid.setHeight(inputRows.length);

function saveMapToFile(filename: string): void {
  const callback = (nodeGrid: Node[][]) =>
    nodeGrid.map((xRow) => xRow.map((n) => n.value).join("")).join("\n");

  mapGrid.saveMapGridToFile(filename, callback);
}

saveMapToFile("checkpoint-01.txt");

function findShortestPathToEnd(
  startingPos: CoordinateXY,
  endPos: CoordinateXY,
  q: Queue<Node>,
  mapGrid: GridContainer<Node, undefined>
) {
  while (q.size()) {
    const [currentNode, nodeIdx] = findLowestCostNodeInQueue(q);

    if (currentNode === undefined || nodeIdx === undefined) {
      throw new Error("We had an issue finding a lowest value node");
    }

    if (currentNode.coord.x === endPos.x && currentNode.coord.y === endPos.y) {
      console.log("WE FOUND DA END AGAIN, path cost:", currentNode.getCost());
      return currentNode;
      break;
    }

    const cardinalCoordinates = getAllCardinalCoordinatesIter(
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

    currentNode.setValue("O");
    mapGrid.setCoordGridItem(currentNode.coord, currentNode);
    saveMapToFile("checkpoint-03.txt");
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
function logNodeGrid() {
  mapGrid.logCurrentGrid((row, i, g) => row.map((node) => node.value).join(""));
}
logNodeGrid();

const shortestCostPath = findShortestPathToEnd(
  startNode.coord,
  endNode.coord,
  q,
  mapGrid
);
// after finding shortest path, traverse the path, and find the cost of savings
// if we were to cut through the walls... something like this. We might need
// to modify the shortest path algo so that we can see the cost saving of cutting
// through a wall.
// We could do it while traversing the path, going in with the constraint
// that the path is linear / no branches

// 2-19
// we can find the shortest path, then we can know the cost of a certain
// node to the end of the path
// with this, we can traverse the path from start to end again and
// check a specific set of tiles that are always going to be accessible as a
// 'cheat'

// a cheat will always be 2 moves, because at the end of move 2,
// we must be back on a tile that isn't a wall.

if (shortestCostPath === undefined) {
  throw new Error("We somehow didnt find a shortest path... weird");
}

class NodeCheatSavingsMap extends Map<number, number> {
  addToCheatSavings(savings: number) {
    const curSavings = this.get(savings);
    this.set(savings, (curSavings === undefined ? 0 : curSavings) + 1);
    console.log("adding to cheat savings", savings);
  }

  getMinimumCheatSavings(minimum: number) {
    const timeSavingEntries = [];
    const orderedKeysEntries = [...this.entries()].sort((a, b) =>
      a[0] > b[0] ? a[0] : b[0]
    );
    console.log("T");
    for (const [timeSavings, numOfOccurrences] of this.entries()) {
      if (timeSavings >= minimum) {
        timeSavingEntries.push([timeSavings, numOfOccurrences]);
      }
    }
    return timeSavingEntries;
  }
}

function getCurrentNodeCheatSavings(
  node: Node,
  mapGrid: GridContainer<Node, undefined>,
  nodeCheatSavings: NodeCheatSavingsMap
): unknown {
  // in the example below is any target, `t`, that a Node, `N`, can potentially cheat to
  //  - - t - -
  //  - t - t -
  //  t - N - t
  //  - t - t -
  //  - - t - -

  // grab all possible targets
  const cardinalTargets = getAllCardinalCoordinatesIterWithOffset(
    node.coord,
    undefined,
    2
  );
  const ordinalTargets = getAllOrdinalCoordinates(node.coord);
  const targets = [...cardinalTargets, ...ordinalTargets].filter(
    (e) => e !== undefined
  );

  // check possible targets in mapgrid to see if cheating from curr node (pathing from end)
  // cost to target node >= 2
  // I think the minimum time we can save by cheating / skipping a block is
  // 2 'picoseconds'
  // consider the case where there is only 1 tile that blocks / can be skipped
  // the only skip you would do is straight through it
  // which would save you two 'seconds' since the path to go around costs 4
  // but the path to go through costs two

  // anyways. the next time you look at this, you need to go through all the
  // targets and see how much they cost. If they result in savings, add it to
  // node cheat savings map

  console.log("targets", targets);
  for (const target of targets) {
    console.log("grabbing target", target);
    const nodeTarget = mapGrid.getCoordGridItem(target);
    if (nodeTarget === undefined || nodeTarget.value === "#") {
      console.log("TODO");
      continue;
    }
    // we're not counting the current nodes
    // so subtract 2
    const savings = node.cost - nodeTarget.cost - 2;

    if (savings >= 2) {
      // we're going to print the mapgrid to get a good sense for
      // where the current node / target are. First we change their values

      // const previousNodeValue = node.getValue()
      // node.setValue(chalk.bgBlueBright("S")) // S for Source
      // const previousNodeTargetValue = nodeTarget.getValue()
      // nodeTarget.setValue(chalk.bgBlueBright("T")) // T for target

      // mapGrid.setCoordGridItem(node.coord, node)
      // mapGrid.setCoordGridItem(nodeTarget.coord, nodeTarget)

      // // logNodeGrid()

      // // reset their values
      // node.setValue(previousNodeValue)
      // nodeTarget.setValue(previousNodeTargetValue)
      // mapGrid.setCoordGridItem(node.coord, node)
      // mapGrid.setCoordGridItem(nodeTarget.coord, nodeTarget)

      nodeCheatSavings.addToCheatSavings(savings);
    }
  }

  return nodeCheatSavings;
}

// now we follow the path backwards.
// while we do that, we can see how much time we can save on specific cheats?
const pathQ = new Queue<Node>([shortestCostPath]);
const nodeCheatTotalSavings = new NodeCheatSavingsMap();

// init q with our starting point to kick off the process
while (pathQ.size()) {
  const currNode = pathQ.dequeue();
  if (currNode === undefined) {
    console.log("We ran out of nodes in the q");
    break;
  }

  getCurrentNodeCheatSavings(currNode, mapGrid, nodeCheatTotalSavings);

  pathQ.enqueue(currNode.getPrevious());
}

// at this point, nodeCheatTotalSavings should have all the positive savings
// possible in our traversal of the map

// we can just figure out a nice way to tally up the results and
// log it out
const MIN_CHEAT_SAVINGS = 100;
// console.log(nodeCheatTotalSavings)
const minimumCheatSavings =
  nodeCheatTotalSavings.getMinimumCheatSavings(MIN_CHEAT_SAVINGS);

// save savings to file
function persistSavingsToFile(filePath: string, savings: NodeCheatSavingsMap) {
  const sortedSavingsArr: number[] = [];

  for (const v of savings.entries()) {
    // sort into the array based on their key which is a number
    sortedSavingsArr[v[0]] = v[1];
  }

  const savingsStr = sortedSavingsArr
    .map((e, i) => `${i} => ${e}`)
    .filter((v) => v !== undefined)
    .join("\n");
  fs.writeFileSync(filePath, savingsStr);
}

persistSavingsToFile("./savings.txt", nodeCheatTotalSavings);

let costSavingsOccurrences = 0;
for (const [saving, occurrence] of minimumCheatSavings) {
  costSavingsOccurrences += occurrence
}

console.log(
  `num of cheat savings above minimum ${MIN_CHEAT_SAVINGS} : ${costSavingsOccurrences}`
);
