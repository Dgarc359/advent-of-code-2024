import { GridContainer } from '@/util/grid-container'
import { getAllCardinalCoordinates, getAllCardinalCoordinatesIter } from '@/util/grid-util';
import { Queue } from '@/util/queue'
import { CoordinateXY } from '@/util/types'
import fs from 'node:fs'

const input = fs.readFileSync('input.txt').toString();

// TODO: uncomment this when you're ready, obi wan
const gridDimensions = { x: 70, y: 70 }
// const gridDimensions: CoordinateXY = { x: 6, y: 6 }

const startingPos: CoordinateXY = { x: 0, y: 0 }
// yes. we're going to use grid dimensions for other things and
// we want to save the coordinates for exit position.
// this theoretically _can_ be optimized for memory
// but we're optimizing for readbility right now
const exitPos: CoordinateXY = { ...gridDimensions }

// this is pretty specific to the problem space,
// 'byte' in this case is actually just a coordinate
// falling into a grid, stopping someone from taking a path around them
// the number is going to be the # of rows we iterate on the given input
// const numOfBytesToSimulate = 12;
// TODO: uncomment when you're ready, obi wan
const numOfBytesToSimulate = 1024;

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
}

const q = new Queue<Node>();
const mapGrid = new GridContainer<Node, undefined>(undefined)

// create grid of starting nodes
for (let y = 0; y <= gridDimensions.y; y++) {
  mapGrid.pushToGrid(Array(gridDimensions.x + 1)
    .fill(undefined)
    // if we wanted to, we could set the cost of the starting
    // node during this mapping
    .map((v, x) => new Node('.', { x, y }))
  )
}

mapGrid.setHeight(gridDimensions.y + 1)
mapGrid.setWidth(gridDimensions.x + 1)

function saveMapToFile(filename: string): void {
  const callback = (nodeGrid: Node[][]) => nodeGrid
    .map((xRow) => xRow.map((n) => n.value).join(''))
    .join('\n')

  mapGrid.saveMapGridToFile(filename, callback)
}

saveMapToFile('checkpoint-01.txt')


const inputArr = input
  .split('\n')
  .map((el) => {
    const [x, y] = el.split(",").map((v) => Number(v).valueOf())
    return { x, y } as CoordinateXY
  });

console.log('created input arr', inputArr)

// go through `numOfBytesToSimulate` to place impassable walls in
// the grid
for (let i = 0; i < numOfBytesToSimulate; i++) {
  console.log('coordinate', inputArr[i])
  const gridNode = mapGrid.getCoordGridItem(inputArr[i]);
  if (gridNode === undefined) {
    throw new Error("We somehow have no grid node??")
  }
  gridNode.setValue("#")
  mapGrid.setCoordGridItem(inputArr[i], gridNode)
}
// mapGrid.saveMapGridToFile('checkpoint-02.txt')
saveMapToFile('checkpoint-02.txt')

mapGrid.forEach((node, i) => {
  // we'll be adding nodes to our queue now
  // if we find the starting node (0,0)
  // we'll set the cost to 0 before enqueueing it
  if (node.coord.x === startingPos.x && node.coord.y === startingPos.y) {
    node.setCost(0);
  }

  if (node.value === ".") {
    q.enqueue(node);
  }
})

function findShortestPathToEnd(startingPos: CoordinateXY, endPos: CoordinateXY, q: Queue<Node>, mapGrid: GridContainer<Node, undefined>) {

  while(q.size()) {
    const [currentNode, nodeIdx] = findLowestCostNodeInQueue(q);

    if(currentNode === undefined || nodeIdx === undefined) {
      throw new Error("We had an issue finding a lowest value node")
    }

    if(currentNode.coord.x === endPos.x && currentNode.coord.y === endPos.y) {

      console.log("WE FOUND DA END AGAIN, path cost:", currentNode.getCost())
      break;
    }

    const cardinalCoordinates = getAllCardinalCoordinatesIter(currentNode.coord)
    const cardinalsStillInQueue = cardinalCoordinates.filter((coord) => coordIsStillInQueue(coord, q))

    for (const cardinal of cardinalsStillInQueue) {
      const calculatedCostForMoveToCardinal = currentNode.cost + 1;
      // const node = mapGrid.getCoordGridItem(cardinal)!;
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


findShortestPathToEnd(startingPos, exitPos, q, mapGrid)