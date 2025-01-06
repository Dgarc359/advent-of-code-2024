import { CoordinateXY } from '@/util/types';
import fs from 'node:fs';

const input = fs.readFileSync('./input.txt')

// const WIDTH = 11;
// const HEIGHT = 7;

// TODO: uncomment when using actual input
const STEPS = 100;
const WIDTH = 101;
const HEIGHT = 103;

// maybe the quadrants will be given as a string or something
// if we want to re-use this.
interface IQuadrantSorter<T> {
  getCurrentQuadrant: (coord: CoordinateXY) => T
};

type Quadrants = "north-west" | "north-east" | "south-west" | "south-east" | -1

class RobotQuadrantSorter implements IQuadrantSorter<Quadrants> {
  width: number;
  height: number

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // available  quadrants will be 0 - 3
  getCurrentQuadrant(coord: CoordinateXY): Quadrants {
    // get quadrant instructions


    const widthMidpoint = this.width / 2;
    const heightMidpoint = this.height / 2;

    if(coord.x < widthMidpoint && coord.y < heightMidpoint) {
      return "north-west";
    }

    if(coord.x > widthMidpoint && coord.y < heightMidpoint) {
      return "north-east"
    }

    if(coord.x < widthMidpoint && coord.y > heightMidpoint) {
      return "south-west"
    }

    if(coord.x > widthMidpoint && coord.y > heightMidpoint) {
      return "south-east"
    }

    // -1 indicates the number is not in any respective quadrant
    return -1
  }
}

class Robot {
  startingPosition: CoordinateXY;
  movementVector: CoordinateXY;
  // this way, each robot can have its own custom wander width / height
  // and its movements are calculated per robot
  wanderWidthHeight: CoordinateXY;
  currentPosition: CoordinateXY;

  constructor(startPos: CoordinateXY, movementVector: CoordinateXY, wanderWidthHeight: CoordinateXY) {
    this.startingPosition = startPos;
    this.currentPosition = startPos;
    this.movementVector = movementVector;
    this.wanderWidthHeight = wanderWidthHeight;
  }

  calculatePositionAfterXSteps(steps: number) {
    const xArr: number[] = Array(this.wanderWidthHeight.x).fill(0).map((e, i) => 0 + i)
    const yArr: number[] = Array(this.wanderWidthHeight.y).fill(0).map((e, i) => 0 + i)

    // we might be able to modulus here...
    const xSteps = (this.currentPosition.x + (this.movementVector.x * steps)) % this.wanderWidthHeight.x;
    const ySteps = (this.currentPosition.y + (this.movementVector.y * steps)) % this.wanderWidthHeight.y;

    const x = xArr.at(xSteps);
    const y = yArr.at(ySteps);

    if(x === undefined || y === undefined) {
      throw new Error("????")
    }
    this.setCurrentPos(x, y)
  }

  setCurrentPos(x: number, y: number) {
    this.currentPosition = {x, y}
  }
}


// this var name will make sense further down
const domoArigatou: Robot[] = [];

type QuadrantRobots = Robot[];

// this is going to be used to sort the robots into quadrants
const quadrantSorter = new RobotQuadrantSorter(WIDTH - 1, HEIGHT - 1);
const quadrantMap: Map<Quadrants, QuadrantRobots> = new Map();

for(const robotInstructions of input.toString().split("\n")) {
  const position = parseRobotPosition(robotInstructions);
  const vector = parseRobotVector(robotInstructions);

  // console.log("got got POS and VECTOR")

  if(!position || !vector) {
    throw new Error("WE DIDNT GET POS OR VECTOR?!?!?!?!?")
  }

  domoArigatou.push(new Robot(position, vector, {x: WIDTH, y:HEIGHT}))
}

for (const mrRoboto of domoArigatou) {
  mrRoboto.calculatePositionAfterXSteps(STEPS);

  const quadrant = quadrantSorter.getCurrentQuadrant(mrRoboto.currentPosition);

  if(quadrant === -1) {
    continue;
  }

  // put robots into quadrant map
  quadrantMap.set(quadrant, [...quadrantMap.get(quadrant) ?? [], mrRoboto])
}

console.log("calculated roboto positions!! total safety factor", getTotalSafetyFactor(quadrantMap))

function getTotalSafetyFactor(quadrantMap: Map<Quadrants, QuadrantRobots>):number {

  let product = 1;

  for (const [quadrants, robots] of quadrantMap.entries()) {
    product = robots.length * product;
  }

  return product;
}

function parseRobotPosition(str: string): CoordinateXY | undefined {
  const posStrIdx = str.indexOf("v=");

  if(posStrIdx === -1) {
    return undefined
  }

  const splitStr = str.slice(0, posStrIdx);
  const posXYStr = splitStr.split("=")[1].toString().trim();

  const [x, y] = posXYStr.split(",").map((n) => Number(n).valueOf())

  return {x, y}
}

function parseRobotVector(str: string): CoordinateXY | undefined {
  const posStrIdx = str.indexOf("v=");

  if(posStrIdx === -1) {
    return undefined
  }

  const splitStr = str.slice(posStrIdx);
  const posXYStr = splitStr.split("=")[1].toString().trim();

  const [x, y] = posXYStr.split(",").map((n) => Number(n).valueOf())

  return {x, y}
}

