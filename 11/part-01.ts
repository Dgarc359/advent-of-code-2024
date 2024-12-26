import fs from 'node:fs';

let stones = fs.readFileSync('input.txt')
  .toString()
  .split(" ")
  .map(e => Number(e).valueOf());

const NUM_OF_BLINKS = 25;

for (let i = 0; i < NUM_OF_BLINKS; i++) {
  stones = rearrangeStones(stones);
}


function rearrangeStones(stones: number[]): number[] {
  const newArr: number[] = [];

  for(const stone of stones) {
    newArr.push(...transformStoneWithRules(stone))
  }

  return newArr;
}

function transformStoneWithRules(stone: number): number[] {
  if(stone === 0) return [1];

  if(String(stone).length % 2 === 0) {
    const stringifiedStone = String(stone).split("");
    const middleIdx = stringifiedStone.length / 2;
    const firstHalf = stringifiedStone.slice(0, middleIdx).join("");
    const secondHalf = stringifiedStone.slice(middleIdx, stringifiedStone.length).join("");
    console.log('splitting', stone,firstHalf, secondHalf);

    return [ Number(firstHalf).valueOf(), Number(secondHalf).valueOf() ];
  }

  const mulResult = stone * 2024
  return [mulResult]
}

console.log(stones.length);