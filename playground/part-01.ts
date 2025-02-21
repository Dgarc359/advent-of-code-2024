import { GridContainer } from "@/util/grid-container";
import {
  getAllCardinalCoordinates,
  getAllCardinalCoordinatesIter,
} from "@/util/grid-util";
import { Queue } from "@/util/queue";
import { sleep } from "@/util/time";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

class Node {
  // reference impl: https://en.wikipedia.org/wiki/Dijkstra's_algorithm#Algorithm
  distanceFromStartValue: number = Infinity;
  coord: CoordinateXY;
  previousNode?: Node;


  constructor(coord: CoordinateXY) {
    this.coord = coord;
  }

  setDistance(n: number) {
    this.distanceFromStartValue = n
  }

  getDistance() { return this.distanceFromStartValue }

  valueOf(): string {
    return `${this.coord.x}:${this.coord.y}`
  }
}

const nodeOne = new Node({x: 1, y: 2})
const nodeOneCopy = new Node({x: 1, y: 2})

const nodeTwo = new Node({x: 2, y: 2})


const qOne = new Queue([
  nodeOne
])



const qTwo = new Queue([
  nodeOne, nodeTwo
])



console.log("node one equals node two", nodeOne === nodeTwo)

console.log('node one equals node one copy', nodeOne === nodeOneCopy)


/************************************************************************* */

const day20playgroundInput = fs.readFileSync('input-day20-01.txt').toString().split("\n")

let day20PlaygroundSum = 0;
for (const row of day20playgroundInput) {
  const [savings, occurrences] = row.split("=>").map(v => Number(v.trim()).valueOf())
  day20PlaygroundSum += occurrences;
}


console.log('day 20 playgroudn occurneces', day20PlaygroundSum)

