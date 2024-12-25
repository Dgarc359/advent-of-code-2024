import fs from 'node:fs'

const diskMap = fs.readFileSync('input-simple-02.txt');

type ExpandedDiskMap = (number | '.')[];
type EmptyFileIndex = { start: number, end: number }[]

// we start with a file, then we switch between file and free space every block
let isFile = true;
let checksum = 0;
let fileIndex = 0;
let expandedDiskMap: ExpandedDiskMap = [];
const rearrangedDiskMap: number[] = [];
const emptyFileIndexes: EmptyFileIndex = [];

for (const [index, fileOrFreeSpace] of diskMap.toString().split("").entries()) {
  const numOfBlocks = Number(fileOrFreeSpace).valueOf()

  if (isFile) {
    expandedDiskMap.push(...Array(numOfBlocks).fill(fileIndex));
    fileIndex++;
  } else {
    emptyFileIndexes.push({ start: expandedDiskMap.length, end: expandedDiskMap.length + numOfBlocks - 1 });
    expandedDiskMap.push(...Array(numOfBlocks).fill("."))
  }

  isFile = !isFile;
}

console.log('expanded disk map',expandedDiskMap)

function getLastNumberInArray(diskMap: ExpandedDiskMap, trueLength: number): { idxOfLastNumber: number, lastNumber: number, negativeIndex: number } | undefined {
  for(const [index, block] of diskMap.entries()) {
    if(!(index < trueLength - 1)) continue;

    const lastValue = diskMap.at(-index)
    if(lastValue && lastValue !== '.') return {idxOfLastNumber: diskMap.length - index, lastNumber: lastValue, negativeIndex: -index };

    else continue;
  }
}

function rearrangeDiskMap(diskMap: ExpandedDiskMap, emptyFileIndexes: EmptyFileIndex) {
  let trueLength = diskMap.length;

  for (const [index, block] of diskMap.entries()) {
    if(!(index < trueLength - 1)) {
      return;
    }

    if (block === '.') {
      const lastNumberAndIdx = getLastNumberInArray(diskMap, trueLength);

      if(!lastNumberAndIdx) throw new Error("Something weird happened trying to get a number when a block is open..");

      rearrangedDiskMap.push(lastNumberAndIdx.lastNumber)
      trueLength += lastNumberAndIdx.negativeIndex;
    } else {
      rearrangedDiskMap.push(block)
    }
  }
}

rearrangeDiskMap(expandedDiskMap, emptyFileIndexes)

// checksum = rearrangedDiskMap.map((prev, curr, idx, arr) => {
//   console.log(`math is: ${idx} * ${curr} + ${prev}`)
//   const mulVal = curr * idx;

//   return mulVal + prev;
// })

checksum = rearrangedDiskMap.map((v, idx) => {return v * idx}).reduce((prev, curr) => prev + curr)

// console.log(expandedDiskMap.toString(), "emptyFileIndex", JSON.stringify(emptyFileIndexes));
console.log(rearrangedDiskMap, 'checksum', checksum)
