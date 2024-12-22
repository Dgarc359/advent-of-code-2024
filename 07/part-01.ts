import fs from "node:fs";

// const puzzleInput = fs.readFileSync("./input-test.txt").toString();
const puzzleInput = fs.readFileSync("./input.txt").toString();
// const puzzleInput = fs.readFileSync("./input-should-count.txt").toString();

let puzzleAnswerVal = 0;

function solve(originalTestVal: number, arr: number[]): boolean {
  let isSolvable = false;

  if (arr.length === 1) {
    if (originalTestVal === arr[0]) {
      return true;
    } else {
      return false;
    }
  }

  const currNumber = arr[arr.length - 1];

  const divisionVal = originalTestVal / currNumber;
  if (Number.isInteger(divisionVal)) {
    isSolvable = solve(divisionVal, arr.slice(0, -1));
  }

  const subtractionVal = originalTestVal - currNumber;
  if (!isSolvable && Number.isInteger(subtractionVal)) {
    isSolvable = solve(subtractionVal, arr.slice(0, -1));
  }
  return isSolvable;
}

for (const equation of puzzleInput.split("\n")) {
  const [testValue, equationNumbers] = equation.split(":").map((e) => e.trim());
  const originalTestVal = Number(testValue).valueOf();

  let sortedEquationNumbers: number[] = equationNumbers
    .split(" ")
    .map((e) => Number(e).valueOf());

  const isSolvable = solve(originalTestVal, sortedEquationNumbers);
  if (isSolvable) {
    puzzleAnswerVal += originalTestVal;
  }
}

console.log("D7 P1 ANSWER:", puzzleAnswerVal);
