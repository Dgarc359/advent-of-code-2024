import * as fs from "node:fs";

// read file
const file = fs.readFileSync("./input.txt").toString();
const fileArr = file.split("\n");

let safeReportCount = 0;

for (const reportRow of fileArr) {
    // report row is empty so skip it
    if (reportRow === "") {
        continue;
    }

    let increasingOrDecreasing: "increasing" | "decreasing" | undefined;
    let previousNum: number | undefined;
    let isSafeReport: boolean = false;
    let indexToSkip = -1;

    const reports = reportRow.split(" ")

    try {
        reports.forEach((report, i, reportsArr) => {
            if (previousNum) {
                const currentNum = new Number(report).valueOf();
                const currentIsGreaterThanPrevious = currentNum > previousNum;

                if (!increasingOrDecreasing) {
                    // first interaction, decide if we're increasing or decreasing
                    if (currentIsGreaterThanPrevious) {
                        increasingOrDecreasing = "increasing"
                    } else {
                        increasingOrDecreasing = "decreasing"
                    }
                }

                if (passesSafetyChecks(increasingOrDecreasing, currentIsGreaterThanPrevious, currentNum, previousNum)) {
                    isSafeReport = true
                }
                else {
                    //check dampener conditions are true
                    const lookAheadIndex = i + 1;
                    if (lookAheadIndex >= reportsArr.length) {
                        isSafeReport = false;
                        throw new Error("can't look ahead outside of array")
                    }
                    const lookAheadVal = new Number(reportsArr[lookAheadIndex]).valueOf();
                    let newCurrentIsGreaterThanPrevious: boolean = lookAheadVal > previousNum;

                    // if index to skip is !== -1, then we've already done a lookahead, we can't lookahead
                    // again...
                    if (
                        indexToSkip === -1
                        && passesSafetyChecks(increasingOrDecreasing, newCurrentIsGreaterThanPrevious, lookAheadVal, previousNum) 
                    ) {
                        isSafeReport = true;
                        indexToSkip = i;
                    } else {
                        isSafeReport = false;
                        // cannot break out of forEach, need to throw instead
                        // break;
                        throw new Error("All conditions failed")
                    }
                }

            }
            if (indexToSkip !== i) {
                previousNum = new Number(report).valueOf();
            }
        })
    } catch (e) {
        isSafeReport = false;
        // caught error, we threw it to exit the `forEach`
        // console.log("caught error")
    }


    if (isSafeReport) {
        console.log("safe")
        safeReportCount += 1;
    }else {
        console.log("unsafe")
    }
}

function passesSafetyChecks(increasingOrDecreasing: "increasing" | "decreasing", currentIsGreaterThanPrevious: boolean, currentNum: number, previousNum: number): boolean {
    if (
        increasingOrDecreasing === "increasing"
        && currentIsGreaterThanPrevious
        && isIncreasingWithinSafeMargins(currentNum, previousNum)) {
        return true;
    }
    else if (
        increasingOrDecreasing === "decreasing"
        && !currentIsGreaterThanPrevious
        && isDecreasingWithinSafeMargins(currentNum, previousNum)
    ) {
        return true;
    }

    return false;

}

function isIncreasingWithinSafeMargins(current: number, previous: number) {
    const diff = current - previous;
    return 1 <= diff && diff <= 3;
}

function isDecreasingWithinSafeMargins(current: number, previous: number) {
    const diff = previous - current;
    return 1 <= diff && diff <= 3;
}

console.log(`P2: The number of safe reports is ${safeReportCount}`)