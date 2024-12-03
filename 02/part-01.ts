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

    let increasingOrDescreasing: "increasing" | "decreasing" | undefined;
    let previousNum: number | undefined;
    let isSafeReport: boolean = false;

    const reports = reportRow.split(" ")

    for (const report of reports) {
        if(previousNum) {
            const currentNum = new Number(report).valueOf();
            const currentIsGreaterThanPrevious = currentNum > previousNum;
            console.log(currentIsGreaterThanPrevious);

            if(!increasingOrDescreasing) {
                // first interaction, decide if we're increasing or decreasing
                if(currentIsGreaterThanPrevious) {
                    increasingOrDescreasing = "increasing"
                } else {
                    increasingOrDescreasing = "decreasing"
                }
            }

            if(
                increasingOrDescreasing === "increasing" 
                && currentIsGreaterThanPrevious 
                && isIncreasingWithinSafeMargins(currentNum, previousNum)) {
                    isSafeReport = true;
                }
            else if(
                increasingOrDescreasing === "decreasing"
                && !currentIsGreaterThanPrevious
                && isDecreasingWithinSafeMargins(currentNum, previousNum)
            ) {
                isSafeReport = true;
            } else {
                isSafeReport = false;
                break;
            }
            
        }

        previousNum = new Number(report).valueOf();
    }


    if(isSafeReport) {
        safeReportCount += 1;
    }
}

function isIncreasingWithinSafeMargins(current: number, previous: number) {
    const diff = current - previous;
    return 1 <= diff && diff <= 3;
}

function isDecreasingWithinSafeMargins(current: number, previous: number) {
    const diff = previous - current;
    return 1 <= diff && diff <= 3;
}

console.log(`P1: The number of safe reports is ${safeReportCount}`)