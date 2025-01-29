import { Queue } from "@/util/queue";
import * as fs from "node:fs";

const input = fs.readFileSync("./input-01.txt").toString().split("\n");

const availablePatternsRecord: Record<string, true> = {};
const availablePatterns = input[0].split(",").map((el) => {
  const pattern = el.trim();

  availablePatternsRecord[pattern] = true;

  return pattern;
});
const requestedPatterns = input.slice(2);

const largestAvailablePattern = availablePatterns.reduce((p, c) => {
  if (p.length >= c.length) {
    return p;
  } else {
    return c;
  }
}).length;

console.log("got avail patterns and requested patterns");

function findPossiblePatterns(
  patterns: Record<string, true>,
  requestedPatterns: string[]
) {
  let possiblePatterns = 0;
  for (const request of requestedPatterns) {
    // construct a map of the requested pattern's characters
    // so we can persist which characters have been mathced with an available
    // pattern
    const requestMap: boolean[] = Array(request.split("").length).fill(false);

    // use a sliding window, make the window smaller every iteration
    // the window grabs a slice of the string and tries to see if it can be
    // matched out of the available patterns
    request.split("").forEach((char, charIdx, arr) => {
      for (let i = 0; i < largestAvailablePattern; i++) {
        const window = arr.slice(charIdx,1+ charIdx + i);

        // the slice we took isn't as long as we expected the window to be
        if (window.length <= i) {
          return;
        }

        // check if the slice we took contains already solved chracters
        // if it does then we need to just go to the next slice
        for (let _i = charIdx; _i < charIdx + i; _i++) {
          if (requestMap[_i] === true) {
            return;
          }
        }

        const windowStr = window.join("");

        if (patterns[windowStr] !== undefined) {
          for (let _i = charIdx; _i <= charIdx + i; _i++) {
            requestMap[_i] = true;
          }
          break;
        }
      }
    });

    // if every character in the requested pattern has been matched with an available pattern
    if (requestMap.every((k) => k === true)) {
      possiblePatterns++;
    } else {
      console.log('impossible!', request)
    }
  }

  return possiblePatterns;
}

const numOfPossiblePatterns = findPossiblePatterns(
  availablePatternsRecord,
  requestedPatterns
);

console.log("found all possible patterns", numOfPossiblePatterns);
