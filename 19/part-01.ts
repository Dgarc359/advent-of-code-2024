import * as fs from "node:fs";

const input = fs.readFileSync("./input.txt").toString().split("\n");

const availablePatternsRecord: Record<string, true> = {};
const availablePatterns = input[0].split(",").map((el) => {
  const pattern = el.trim();

  availablePatternsRecord[pattern] = true;

  return pattern;
});
const requestedPatterns = input.slice(2);

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
        let partitionOfSpanIdx = 0;
        partitionOfSpanIdx <= length - 1;
        partitionOfSpanIdx++
      ) {
        // partition the substring into two parts. We'll go through all the possible permutations
        // this way to see if it is 'part of the language'
        const leftSubstr = characters
          // need to remember that slice END is EXCLUSIVE
          // start + (length - partitionIdx) gives us the index of where the string is broken, accounting for the shifting window
          .slice(startOfSpan, startOfSpan + (length - partitionOfSpanIdx))
          .join("");
        const rightSubstr = characters
          // annoyingly confusing calculations
          // index of the partition in string is the same as above
          // finding the index of the end of the string includes account for the shifting window. Then
          // partitionIdx + (length - partitionIdx) gives us the length of the right substring
          .slice(startOfSpan + (length - partitionOfSpanIdx), startOfSpan + (partitionOfSpanIdx + (length - partitionOfSpanIdx)))
          .join("");

        // our language has more than just single character substrings, it might contain
        // our left / right substring. This is our final check before we see if
        // both our strings can be created at the same time
        if(language[leftSubstr]) {
          CYKArr[leftSubstr.length][startOfSpan].add(leftSubstr)
        }
        if(language[rightSubstr]) {
          CYKArr[rightSubstr.length][startOfSpan + (length - partitionOfSpanIdx)].add(rightSubstr)
        }
        // console.log(""); // breakpoint

        // from wikipedia:
        // if P[p,s,LEFT_SUBSTR] and P[l-p,s+p,RIGHT_SUBSTR] then
        //   set P[l,s,a] = true,
        // if there is something that produces LEFT and RIGHT substr partitions
        // of the current string, then the current string is producible
        if (
          CYKArr[leftSubstr.length][startOfSpan].has(leftSubstr) &&
          (rightSubstr === "" || CYKArr[rightSubstr.length][startOfSpan + (length - partitionOfSpanIdx)].has(
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
  }

  return possiblePatterns;
}

const numOfPossiblePatterns = findPossiblePatterns(
  availablePatternsRecord,
  requestedPatterns
);

console.log("found all possible patterns", numOfPossiblePatterns);
