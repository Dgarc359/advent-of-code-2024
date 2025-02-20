import { GridContainer } from '@/util/grid-container'
import { getAllCardinalCoordinates, getAllCardinalCoordinatesIter, getAllCardinalCoordinatesIterWithOffset, getAllOrdinalCoordinates } from '@/util/grid-util';
import { Queue } from '@/util/queue'
import { CoordinateXY } from '@/util/types'
import fs from 'node:fs'

const inputRows = fs.readFileSync('input.txt').toString().split("\n");

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
  setPrevious(n: Node) { this.prev = n; }
  getPrevious() { return this.prev }

  setCost(c: number) { this.cost = c }
  getCost() { return this.cost }

  setValue(v: any) { this.value = v }
  getValue() { return this.value }

  setCoord(c: CoordinateXY) { this.coord = c }
}

const q = new Queue<Node>();
const mapGrid = new GridContainer<Node, undefined>(undefined)
const startNode = new Node("S", {x: -1 , y: -1})
const endNode = new Node("E", {x: -1 , y: -1})

// create grid of starting nodes
// and queue up walkable nodes for finding shortest path
for (let y = 0; y <= inputRows.length; y++) {
  const xRow = inputRows[y].split("")

  mapGrid.pushToGrid(Array(xRow.length)
    .fill(undefined)
    // if we wanted to, we could set the cost of the starting
    // node during this mapping
    .map((v, x) => {
      const xRowVal = xRow[x]
      const coord = {x, y}
      const newNode = new Node(xRowVal, coord)

      if (xRowVal === "S") {
        startNode.setCoord(coord)
        newNode.setCost(0)
      } else if (xRowVal === "E") {
        endNode.setCoord(coord)
      }

      if (xRowVal=== "S" || xRowVal === "E" || xRowVal === ".") {
        q.enqueue(newNode)
      }

      return newNode 
    })
  )

  mapGrid.setWidth(xRow.length)
}

mapGrid.setHeight(inputRows.length)

function saveMapToFile(filename: string): void {
  const callback = (nodeGrid: Node[][]) => nodeGrid
    .map((xRow) => xRow.map((n) => n.value).join(''))
    .join('\n')

  mapGrid.saveMapGridToFile(filename, callback)
}

saveMapToFile('checkpoint-01.txt')

function findShortestPathToEnd(startingPos: CoordinateXY, endPos: CoordinateXY, q: Queue<Node>, mapGrid: GridContainer<Node, undefined>) {
  while(q.size()) {
    const [currentNode, nodeIdx] = findLowestCostNodeInQueue(q);

    if(currentNode === undefined || nodeIdx === undefined) {
      throw new Error("We had an issue finding a lowest value node")
    }

    if(currentNode.coord.x === endPos.x && currentNode.coord.y === endPos.y) {

      console.log("WE FOUND DA END AGAIN, path cost:", currentNode.getCost())
      return currentNode;
      break;
    }

    const cardinalCoordinates = getAllCardinalCoordinatesIter(currentNode.coord)
    const cardinalsStillInQueue = cardinalCoordinates.filter((coord) => coordIsStillInQueue(coord, q))

    for (const cardinal of cardinalsStillInQueue) {
      const calculatedCostForMoveToCardinal = currentNode.cost + 1;
      const [node, cardinalIdx] = getNodeFromQueue(cardinal, q);
      if(node.value === '#') {
        continue;
      }

      if(calculatedCostForMoveToCardinal < node.cost) {
        node.setCost(calculatedCostForMoveToCardinal);
        node.setPrevious(currentNode)

        q.replace(cardinalIdx, node);
      }
    }

    currentNode.setValue("O")
    mapGrid.setCoordGridItem(currentNode.coord, currentNode)
    saveMapToFile('checkpoint-03.txt')
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
  })

  return [q.dequeue(lowestCostIdx)!, lowestCostIdx]
}

function coordIsStillInQueue(coord: CoordinateXY, q: Queue<Node>): boolean {
  let isStillInQueue = false;

  q.forEach((node) => {
    if (node.coord.x === coord.x && node.coord.y === coord.y) {
      isStillInQueue = true;
    }
  })

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
  })

  return [targetNode, targetIdx]
}


const shortestCostPath = findShortestPathToEnd(startNode.coord, endNode.coord, q, mapGrid)
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
  throw new Error("We somehow didnt find a shortest path... weird")
}

class NodeCheatSavingsMap extends Map<number, number> {
  addToCheatSavings(savings: number) {
    const curSavings = this.get(savings)
    this.set(savings, (curSavings === undefined ? 0 : curSavings) + 1)
    console.log('adding to cheat savings')
  }
}

function getCurrentNodeCheatSavings(node: Node, mapGrid: GridContainer<Node, undefined>, nodeCheatSavings: NodeCheatSavingsMap): unknown {
  // in the example below is any target, `t`, that a Node, `N`, can potentially cheat to
  //  - - t - -
  //  - t - t -
  //  t - N - t
  //  - t - t -
  //  - - t - -

  // grab all possible targets
  const cardinalTargets = getAllCardinalCoordinatesIterWithOffset(node.coord, undefined, 2);
  const ordinalTargets = getAllOrdinalCoordinates(node.coord);
  const targets = [...cardinalTargets, ...ordinalTargets]

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

  for (const target of targets) {
    const nodeTarget = mapGrid.getCoordGridItem(target);
    if (nodeTarget === undefined) {
      console.log('TODO')
      continue
    }

    const savings = node.cost - nodeTarget.cost

    if (savings >= 2) {
      nodeCheatSavings.addToCheatSavings(savings)
    }
  }

  return {}
}


// now we follow the path backwards.
// while we do that, we can see how much time we can save on specific cheats?
const pathQ = new Queue<Node>([shortestCostPath]);
const nodeCheatTotalSavings = new NodeCheatSavingsMap();

// init q with our starting point to kick off the process
while(pathQ.size()){
  const currNode = pathQ.dequeue()
  if(currNode === undefined) {
    console.log("We ran out of nodes in the q")
    break;
  }

  getCurrentNodeCheatSavings(currNode, mapGrid, nodeCheatTotalSavings)

  pathQ.enqueue(currNode.getPrevious())
}

// at this point, nodeCheatTotalSavings should have all the positive savings
// possible in our traversal of the map

// we can just figure out a nice way to tally up the results and
// log it out




