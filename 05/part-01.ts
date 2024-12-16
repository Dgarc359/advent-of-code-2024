import fs from 'node:fs';

const pageOrderingRules = fs.readFileSync('input.txt').toString();
const pageNumbersOfEachUpdate = fs.readFileSync('input-01.txt').toString();

type PageOrderingRule = Record<number, "BEFORE" | "AFTER">;
const pageOrderingRuleMap: Map<number, PageOrderingRule> = new Map();


// this loop will create a map of the instructions
// with the map / contained object, we'll be able to find out
// if the numbers we're seeing in the update are in the correct order.
for (const pageOrderRule of pageOrderingRules.split('\n')) {
  const [before, after] = pageOrderRule.split('|').map((el) => Number(el).valueOf());
  // assumption: page order rules will not be repeated

  let beforeRules = pageOrderingRuleMap.get(before);
  // we might not need the after rules
  let afterRules = pageOrderingRuleMap.get(after);

  if(!beforeRules) {
    beforeRules = {}
  }
  if (!afterRules) {
    afterRules = {}
  }
  // make modifications to before / after rules
  beforeRules[after] = "AFTER";
  afterRules[before] = "BEFORE";


  // set before / after rules in the map again
  pageOrderingRuleMap.set(before, beforeRules)
  pageOrderingRuleMap.set(after, afterRules)
}

// const correctMiddlePageNumbers: number[] = [];

let correctNumberSum: number = 0;

for (const pageNumberUpdate of pageNumbersOfEachUpdate.split('\n')) {
  const pageNumbers = pageNumberUpdate.split(',').map((el) => Number(el).valueOf());

  const seenArr: number[] = [];
  let updatesAreCorrect = true;
  for (const page of pageNumbers) {
    if(seenArr.length !== 0) {
      const rules = pageOrderingRuleMap.get(page);

      if(!rules) continue; // no rules means we can ignore the number basically

      for (const beforeNumber of seenArr) {
        if(!rules[beforeNumber]) continue;

        if(rules[beforeNumber] !== "BEFORE") {
          updatesAreCorrect = false;
        }
      }
    } 

    seenArr.push(page)
  }

  // find middle page number if this series of updates is correct
  if(updatesAreCorrect) {
    const pageNumberUpdateNumArr = pageNumberUpdate.split(',').map(el => Number(el).valueOf())
    correctNumberSum += Number(pageNumberUpdateNumArr[Math.floor(pageNumberUpdateNumArr.length / 2)]).valueOf();
  }
}

console.log(`D5 P1 - Sum is: ${correctNumberSum}`);


