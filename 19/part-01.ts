import { Queue } from "@/util/queue";
import * as fs from "node:fs";

const input = fs.readFileSync("./input.txt").toString().split("\n");

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

// console.log("got avail patterns and requested patterns");

// this functions returns true if the given string is a member of the language
// false otherwise
function CYKAlgorithm(
  input: string,
  language: Record<string, boolean>
): boolean {
  const characters = input.split("");
  const numOfCharacters = characters.length;
  const CYKArr: Set<any>[][] = new Array(numOfCharacters+1).fill(undefined).map(() =>
    new Array<Set<any>>(numOfCharacters).fill(undefined!).map(() => {
      const s = new Set();
      // add empty string into set to be able to match on empty string
      s.add("")
      return s
    })
  );

  // There's gonna be an off by one error here because of 
  // how the indexes are being calculated later on
  for (let i = 0; i < numOfCharacters; i++) {
    if (language[characters[i]]) {
      CYKArr[1][i].add(characters[i]);
    }
  }

  // length will be LESS THAN num of characters. We don't need to 
  // be <= because we already checked length 1 substrings of the input
  // meaning we don't have to check the last character AND / OR the number of characters - length
  for (let length = 2; length <= numOfCharacters; length++) {
    for (
      let startOfSpan = 0;
      // breaking condition ensures that we check the last span that covers the last length of string
      startOfSpan < numOfCharacters - length + 1;
      startOfSpan++
    ) {
      for (
        let partitionOfSpan = 0;
        partitionOfSpan <= length - 1;
        partitionOfSpan++
      ) {
        // partition the substring into two parts. We'll go through all the possible permutations
        // this way to see if it is 'part of the language'
        const leftSubstr = characters
          // need to remember that slice END is EXCLUSIVE
          .slice(startOfSpan, startOfSpan+ (length - partitionOfSpan))
          .join("");
        const rightSubstr = characters
          .slice(startOfSpan + (length - partitionOfSpan), startOfSpan + (partitionOfSpan + (length - partitionOfSpan)))
          .join("");

        if(language[leftSubstr]) {
          CYKArr[leftSubstr.length][startOfSpan].add(leftSubstr)
        }
        if(language[rightSubstr]) {
          CYKArr[rightSubstr.length][startOfSpan + (length - partitionOfSpan)].add(rightSubstr)
        }
        // console.log(""); // breakpoint

        // from wikipedia:
        // if P[p,s,LEFT_SUBSTR] and P[l-p,s+p,RIGHT_SUBSTR] then
        //   set P[l,s,a] = true,
        // if there is something that produces LEFT and RIGHT substr partitions
        // of the current string, then the current string is producible
        if (
          CYKArr[leftSubstr.length][startOfSpan].has(leftSubstr) &&
          (rightSubstr === "" || CYKArr[rightSubstr.length][startOfSpan + (length - partitionOfSpan)].has(
            rightSubstr
          ))
        ) {
          CYKArr[length][startOfSpan].add(
            // add current string to array of PRODUCED strings
            [leftSubstr, rightSubstr].join("")
          );
        }
        else {
          // console.log??
        }
      }
    }
  }

  if (CYKArr[numOfCharacters][0].has(input)) {
    // console.log(
    //   "we got a match for the full size string because we matched everything else!"
    // );
    return true;
  } else {
    return false;
  }
}

function findPossiblePatterns(
  patterns: Record<string, true>,
  requestedPatterns: string[]
) {
  let possiblePatterns = 0;
  for (const request of requestedPatterns) {
    try {
      const cykAlgoResult = CYKAlgorithm(request, patterns)
      // the request was constructed with our dictionary of patterns if true
      if(cykAlgoResult === true) {
        possiblePatterns++;
      }
    } catch (e) {
      console.error('issue with request', request)
      console.log('some error occured', e)
    }

    

    // construct a map of the requested pattern's characters
    // so we can persist which characters have been mathced with an available
    // pattern
    // const requestMap: boolean[] = Array(request.split("").length).fill(false);

    // // use a sliding window, make the window smaller every iteration
    // // the window grabs a slice of the string and tries to see if it can be
    // // matched out of the available patterns
    // request.split("").forEach((char, charIdx, arr) => {
    //   for (let i = 0; i < largestAvailablePattern; i++) {
    //     const window = arr.slice(charIdx, 1 + charIdx + i);

    //     // the slice we took isn't as long as we expected the window to be
    //     if (window.length <= i) {
    //       return;
    //     }

    //     // check if the slice we took contains already solved chracters
    //     // if it does then we need to just go to the next slice
    //     for (let _i = charIdx; _i < charIdx + i; _i++) {
    //       if (requestMap[_i] === true) {
    //         return;
    //       }
    //     }

    //     const windowStr = window.join("");

    //     if (patterns[windowStr] !== undefined) {
    //       for (let _i = charIdx; _i <= charIdx + i; _i++) {
    //         requestMap[_i] = true;
    //       }
    //       break;
    //     }
    //   }
    // });

    // // if every character in the requested pattern has been matched with an available pattern
    // if (requestMap.every((k) => k === true)) {
    //   possiblePatterns++;
    // } else {
    //   console.log("impossible!", request);
    // }
  }

  return possiblePatterns;
}

const numOfPossiblePatterns = findPossiblePatterns(
  availablePatternsRecord,
  requestedPatterns
);

console.log("found all possible patterns", numOfPossiblePatterns);
