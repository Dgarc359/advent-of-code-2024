import fs from "node:fs";

let input = fs.readFileSync("./input.txt").toString().split("\n");

const locks: number[][] = []
const keys: number[][] = []

function getHeights(lockArr: string[]): number[] {
  const heights = new Array(5).fill(0)

  for (let y = 0; y < lockArr.length; y++) {
    const row = lockArr[y]
    for(let x = 0; x < row.length; x++) {
      if (heights[x] === 0 && row[x] === '.') {
        if (y - 1 ===0) {

          heights[x] = Infinity
        }else {
        heights[x] = y - 1
        }
      }
    }
  }

  return heights.map(v => {
    if(v === Infinity) {
      return 0
    } else {
      return v
    }
  });
}


while (true) {
  const idxOfNewline = input.indexOf("")
  let arrToPush = []
  if(idxOfNewline === -1) {
    arrToPush = input
  } else {
    arrToPush = input.slice(0, idxOfNewline)
  }

  if (arrToPush[0] === '#####') {
    const heights = getHeights(arrToPush)
    locks.push(heights)
  } else {
    const heights = getHeights(arrToPush.reverse())
    keys.push(heights)
  }

  if(idxOfNewline === -1) {
    break;
  }
  input = input.slice(idxOfNewline +1)
}


let sumOfLockkeyPairsThatFit = 0;

function lockAndKeyOverlap(lock: number[], key: number[]): boolean {
  for(let i = 0; i < lock.length; i++) {
    const lockVal = lock[i]
    const keyVal = key[i]
    if (lockVal + keyVal >= 6) {
      return true
    }
  }

  return false
}

for(const lock of locks) {
  for (const key of keys) {
    if(lockAndKeyOverlap(lock, key) === false) {
      sumOfLockkeyPairsThatFit = sumOfLockkeyPairsThatFit + 1
    }
  }
}

console.log(sumOfLockkeyPairsThatFit)


