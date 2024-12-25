import fs from 'node:fs'

const diskMap = fs.readFileSync('input.txt');

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

// console.log('expanded disk map',expandedDiskMap)

function getLastNumberInArray(diskMap: ExpandedDiskMap, trueLength: number): { idxOfLastNumber: number, lastNumber: number, negativeIndex: number } | undefined {
  for(const [index, block] of diskMap.entries()) {
    if(diskMap.length - index >= trueLength) continue;

    const lastValue = diskMap.at(-index)
    if(lastValue && lastValue !== '.') return {idxOfLastNumber: diskMap.length - index, lastNumber: lastValue, negativeIndex: -index };

    else continue;
  }
}

function rearrangeDiskMap(diskMap: ExpandedDiskMap, emptyFileIndexes: EmptyFileIndex) {
  let trueLength = diskMap.length;

  for (const [index, block] of diskMap.entries()) {
    console.log(`current index: ${index} current block: ${block}, current true length: ${trueLength}`)
    // console.log(`true length yields this arr: ${diskMap.slice(index, trueLength)}`)
    if(index >= trueLength) {
      return;
    }

    if (block === '.') {
      const lastNumberAndIdx = getLastNumberInArray(diskMap.slice(index, trueLength), trueLength);

      if(!lastNumberAndIdx) break;

      rearrangedDiskMap.push(lastNumberAndIdx.lastNumber)
      trueLength += lastNumberAndIdx.negativeIndex
    } else {
      rearrangedDiskMap.push(block)
    }

    // console.log(`reArranged diskMap: ${rearrangedDiskMap}`)
  }
}

rearrangeDiskMap(expandedDiskMap, emptyFileIndexes)

checksum = rearrangedDiskMap.map((v, idx) => {return v * idx}).reduce((prev, curr) => prev + curr)

console.log('checksum', checksum)
