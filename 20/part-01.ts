import { GridContainer } from '@/util/grid-container'
import { getAllCardinalCoordinates, getAllCardinalCoordinatesIter } from '@/util/grid-util';
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


findShortestPathToEnd(startNode.coord, endNode.coord, q, mapGrid)