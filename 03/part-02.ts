import * as fs from "node:fs";

// read file
const file = fs.readFileSync("./03-input.txt").toString();

const mulRegex = /mul\(\d{1,3},\d{1,3}\)/g
const numRegex = /\d{1,3}/g

const mulMatches = file.match(mulRegex)
const indicesOfDo: number[] = []; 
const indicesOfDont: number[] = [];

// try copying to make sure we're not sharing the same file string
let doFile = new String(file.toString());
let dontFile = new String(file.toString());

let indexPos = 0;
while(true) {
    const doIndex = doFile.indexOf("do()", indexPos);

    if(doIndex < 0) break;

    indicesOfDo.push(doIndex);
    indexPos += doIndex + "do()".length;
}

indexPos = 0;
while(true) {
    const dontIndex = dontFile.indexOf("don\'t()", indexPos);
    if(dontIndex < 0) break;

    indicesOfDont.push(dontIndex);
    indexPos += dontIndex + "don't".length;
}

console.log("do indices", indicesOfDo)
console.log("dont indices", indicesOfDont)


if(!mulMatches) throw new Error("no matches found");

let sum = 0;

indexPos = 0;

for (const regMatch of mulMatches) {
    const indexOfMatch = file.indexOf(regMatch, indexPos);
    indexPos = indexOfMatch + regMatch.length;

    const doDistance = findClosestPositiveIntegerDistance(indicesOfDo, indexPos);
    const dontDistance = findClosestPositiveIntegerDistance(indicesOfDont, indexPos);

    if(dontDistance === -1 || (doDistance <= dontDistance && doDistance !== -1)) {
        const numMatches = regMatch.match(numRegex);
        
        if(!numMatches) continue;
        // console.log(numMatches)
        
        const numOne = new Number(numMatches[0]).valueOf();
        const numTwo = new Number(numMatches[1]).valueOf();

        sum += Math.imul(numOne, numTwo);
    }
}

console.log(`P2: sum is ${sum}`)

function findClosestPositiveIntegerDistance(arr: number[], sourceNum: number) {
    let distance = -1;

    for(const num of arr) {

        if(sourceNum - num > 0) {
            distance = sourceNum - num;
        }
    }
    return distance
}