import * as fs from "node:fs";

// read file
const file = fs.readFileSync("./03-input.txt").toString();

const mulRegex = /mul\(\d{1,3},\d{1,3}\)/g
const numRegex = /\d{1,3}/g

const matchDo = /do\(\)/g
const matchDont = /dont\(\)/g


const mulMatches = file.match(mulRegex)


if(!mulMatches) throw new Error("no matches found");

let sum = 0;
console.log("number of matches", mulMatches.length);

for (const regMatch of mulMatches) {
    const numMatches = regMatch.match(numRegex);
    
    if(!numMatches) continue;
    // console.log(numMatches)
    
    const numOne = new Number(numMatches[0]).valueOf();
    const numTwo = new Number(numMatches[1]).valueOf();

    sum += Math.imul(numOne, numTwo);
}

console.log(`P1: sum is ${sum}`)