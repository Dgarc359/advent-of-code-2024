import { coordinateXYToString } from "@/util/grid-util";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

const inputFile = fs.readFileSync("input.txt").toString();

const instructionGroups = inputFile.split("\n");

const xRegex = /X[+=](?<num>\d+)/g;
const yRegex = /Y[+=](?<num>\d+)/g;
const A_PRICE = 3;
const B_PRICE = 1;

class ValidPrizeCombo {
  bValues: CoordinateXY;
  aValues: CoordinateXY;
  totalCost: number;
  totalTokens: number;

  constructor(
    a: CoordinateXY,
    numOfA: number,
    b: CoordinateXY,
    numOfB: number
  ) {
    this.aValues = a;
    this.bValues = b;
    this.totalCost = A_PRICE * numOfA + B_PRICE * numOfB;
    this.totalTokens = numOfA + numOfB;
  }
}

let sumOfCheapestPrizes = 0;

for (let i = 0; i < instructionGroups.length; i += 4) {
  const aInstr = instructionGroups[i];
  const bInstr = instructionGroups[i + 1];
  const prizeCoords = instructionGroups[i + 2];

  const aXY = getXYValuesFromString(aInstr);
  const bXY = getXYValuesFromString(bInstr);
  const prizeXY = getXYValuesFromString(prizeCoords);
  console.log("GOT MY THINGS");

  const validPrizeCombos = getValidPrizeCombos(aXY, bXY, prizeXY);

  if(!validPrizeCombos.length) {
    continue;
  }

  const cheapestPrizeCombo = getCheapestPrizeCombo(validPrizeCombos);

  sumOfCheapestPrizes += cheapestPrizeCombo.totalCost;

  // console.log("got cheapest prize", `cheapest prize combo: ${che}`);
}

console.log("sum of cheapest prize combos", sumOfCheapestPrizes)

function getCheapestPrizeCombo(prizeCombos: ValidPrizeCombo[]): ValidPrizeCombo {
  let lowestNumOfTokens = Infinity;
  let cheapestPrize: ValidPrizeCombo = undefined!;

  for(const prize of prizeCombos) {
    if(prize.totalTokens < lowestNumOfTokens) {
      cheapestPrize = prize;
    }
  }

  return cheapestPrize
}

function getXYValuesFromString(str: string): CoordinateXY {
  const xIdx = str.indexOf("X");
  const yIdx = str.indexOf("Y");

  const xStr = str.slice(xIdx, yIdx);
  const xMatches = xStr.matchAll(xRegex);

  let x = undefined;
  for (const xMatch of xMatches) {
    if (xMatch.groups) {
      x = Number(xMatch.groups.num).valueOf();
    }
  }

  const yStr = str.slice(yIdx);
  const yMatches = yStr.matchAll(yRegex);
  let y = undefined;
  for (const yMatch of yMatches) {
    if (yMatch.groups) {
      y = Number(yMatch.groups.num).valueOf();
    }
  }

  if (x === undefined || y === undefined) {
    throw new Error("We had a problem making x and y vals houston");
  }

  return { x, y };
}

// we can get all possible combinations by going 0 - 99
// and eliminating the x / y combos that add up to more than 100

function getValidPrizeCombos(
  a: CoordinateXY,
  b: CoordinateXY,
  prize: CoordinateXY
): ValidPrizeCombo[] {
  const validPrizeCombos: ValidPrizeCombo[] = [];
  const MAX = 101;

  const aValMap: Map<string, number> = new Map();

  const bValMap: Map<string, number> = new Map();
  const bXValMap: Map<number, number> = new Map();
  const bYValMap: Map<number, number> = new Map();

  Array(MAX)
    .fill(undefined)
    .forEach((e, i) => {
      const x = b.x * i;
      const y = b.y * i;
      bValMap.set(coordinateXYToString({ x, y }), i);
      bXValMap.set(x, i);
      bYValMap.set(y, i);
    });

  Array(MAX)
    .fill(undefined)
    .map((e, i) => {
      const oppositeXCoord = getOppositeNeededCoordinate(
        a.x,
        i,
        MAX - 1,
        prize.x,
        bXValMap
      );
      const oppositeYCoord = getOppositeNeededCoordinate(
        a.y,
        i,
        MAX - 1,
        prize.y,
        bYValMap
      );

      if (!oppositeXCoord || !oppositeYCoord) {
        // console.log("No opposite cord")
        return;
      }

      console.log("got opposite x y coords");

      const possiblyBVal = bValMap.get(
        coordinateXYToString({
          x: oppositeXCoord.value,
          y: oppositeYCoord.value,
        })
      );

      if (possiblyBVal === undefined) {
        return;
      }

      console.log("got a b val");

      // TODO: there's a bug here giving multiple values for the solution

      const x = a.x * i;
      const y = a.y * i;

      validPrizeCombos.push(
        new ValidPrizeCombo(
          { x, y },
          i,
          {
            x: oppositeXCoord.value,
            y: oppositeYCoord.value,
          },
          possiblyBVal
        )
      );

      aValMap.set(coordinateXYToString({ x, y }), i);
      return { x, y };
    });

  return validPrizeCombos;
}

// a * b + c * d = e
// c = [e - (a * b)] / d

function getOppositeNeededCoordinate(
  initialAttemptValue: number, // a
  numOfInitialAttempts: number, // b
  maxNumOfAttempts: number,
  prizeValue: number, // e
  oppositeValMap: Map<number, number>
) {
  for (let attemptNum = 1; attemptNum <= maxNumOfAttempts; attemptNum++) {
    const targetAttemptValue = (prizeValue - (numOfInitialAttempts * initialAttemptValue)) / attemptNum

    const oppositeValIndex = oppositeValMap.get(targetAttemptValue);

    if (oppositeValIndex === undefined) {
      continue;
    }

    return {
      value: targetAttemptValue,
      oppositeValIndex,
    };
  }

  return undefined
}
