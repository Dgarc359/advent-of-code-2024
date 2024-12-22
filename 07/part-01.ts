import fs from "node:fs";

const puzzleInput = fs.readFileSync("./input-test.txt").toString();

let puzzleAnswerVal = 0;

function solve(originalTestVal: number, arr: number[]): boolean {

  let testValNum = originalTestVal;
  let isSolvable = false;

  for (let i = arr.length - 1; i >= 0; i--) {
    const currNumber = arr[i];

    if (Number.isInteger(testValNum / currNumber)) {
      // testValNum = testValNum / currNumber;
      isSolvable = solve(testValNum / currNumber, arr.slice(0, i))
      // if (isSolvable) return true;
    } 
    
    if (Number.isInteger(testValNum - currNumber)) {
      isSolvable = solve(testValNum - currNumber, arr.slice(0, i))
      // if(isSolvable) return true;
    }

    // return false;

    // if (i === 1) {
    //   const divisionOption = testValNum / currNumber;
    //   const subtractionOption = testValNum - currNumber;

    //   if (divisionOption === arr[0] || subtractionOption === arr[0]) {
    //     console.log("original test value that counts", originalTestVal);
    //     // puzzleAnswerVal += originalTestVal;
    //     return true;
    //   } else {
    //     console.log("test value didnt count", originalTestVal);
    //   }
    // }

    // if (Number.isInteger(testValNum / currNumber)) {
    //   testValNum = testValNum / currNumber;
    // } else if (Number.isInteger(testValNum - currNumber)) {
    //   testValNum = testValNum - currNumber;
    // }
  }
  return isSolvable
}

for (const equation of puzzleInput.split("\n")) {
  const [testValue, equationNumbers] = equation.split(":").map((e) => e.trim());
  const originalTestVal = Number(testValue).valueOf();
  // let testValNum = originalTestVal;

  // sort the numbers from highest to lowest

  // console.log("target value", testValue, "eq numbers", equationNumbers);
  let sortedEquationNumbers: number[] = equationNumbers
    .split(" ")
    .map((e) => Number(e).valueOf());

  
  if(solve(originalTestVal, sortedEquationNumbers)) {
    puzzleAnswerVal += originalTestVal;
  }
  // check going backwards first
  // for (let i = sortedEquationNumbers.length - 1; i >= 0; i--) {
  //   const currNumber = sortedEquationNumbers[i];
  //   if (i === 1) {
  //     const divisionOption = testValNum / currNumber;
  //     const subtractionOption = testValNum - currNumber;

  //     if (divisionOption === sortedEquationNumbers[0] || subtractionOption === sortedEquationNumbers[0]) {
  //       console.log("original test value that counts", originalTestVal);
  //       puzzleAnswerVal += originalTestVal;
  //     } else {
  //       console.log("test value didnt count", originalTestVal);
  //     }
  //     break;
  //   }

  //   if (Number.isInteger(testValNum / currNumber)) {
  //     testValNum = testValNum / currNumber;
  //   } else if (Number.isInteger(testValNum - currNumber)) {
  //     testValNum = testValNum - currNumber;
  //   }
  // }
}

console.log("D7 P1 ANSWER:", puzzleAnswerVal);
