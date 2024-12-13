import { GridContainer } from "@/util/grid-container";
import * as fs from 'node:fs'

const file = fs.readFileSync("./input.txt").toString();

type OutOfBoundsResponse = -1;
type GridTile = string;
const grid = new GridContainer<GridTile, OutOfBoundsResponse>(-1);

const yRows = file.split('\n')

grid.setYLength(yRows.length)
// Add rows to grid container to have access to some simple utils
for (const yRow of yRows) {
  if(yRow === '') continue;

  const xRow = yRow.split("")
  grid.setXLength(xRow.length)
  grid.pushToGrid(xRow)
}

let globalXmasCount = 0;

for (let y = 0; y < grid.yLength; y++) {
  for (let x = 0; x < grid.xLength; x++) {
    const currentChar = grid.getGridItem(x, y);
    if(currentChar === 'X') {
      console.log("hit X char")
      globalXmasCount += countXmas(x, y, grid)
    }
  }
}

// this function should only be called if current char in grid is X
// therefore, we only need to check that the next chars are M A S
// also... sometimes the prettiest solution is the one that was actually made..
function countXmas(currX: number, currY: number, grid: GridContainer<GridTile, OutOfBoundsResponse>): number {
  
  let xmasCount = 0;

  // check cardinals
  // north
  let northCheck = true;
  console.log('checking north')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX, currY - z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      northCheck = false;
      break;
    }
  }
  if(northCheck) xmasCount++;

  let southCheck = true;
  console.log('checking south')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX, currY + z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      southCheck = false;
      break;
    }
  }
  if(southCheck) xmasCount++;

  let eastCheck = true;
  console.log('checking east')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX + z, currY);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      eastCheck = false;
      break;
    }
  }
  if(eastCheck) xmasCount++;

  let westCheck = true;
  console.log('checking west')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX - z, currY);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      westCheck = false;
      break;
    }
  }
  if(westCheck) xmasCount++;


  // check ordinals (NE, NW, SE, SW)
  let northeastCheck = true;
  console.log('checking northeast')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX + z, currY - z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      northeastCheck = false;
      break;
    }
  }
  if(northeastCheck) xmasCount++; 

  let northwestCheck = true;
  console.log('checking northwest')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX - z, currY - z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      northwestCheck = false;
      break;
    }
  }
  if(northwestCheck) xmasCount++; 

  let southeastCheck = true;
  console.log('checking southeast')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX + z, currY + z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      southeastCheck = false;
      break;
    }
  }
  if(southeastCheck) xmasCount++; 

  let southwestCheck = true;
  console.log('checking southwest')
  for(let z = 1; z <= 3; z++) {
    const gridItem = grid.getGridItem(currX - z, currY + z);

    if (gridItem === -1
      || z === 1 && gridItem !== 'M'
      || z === 2 && gridItem !== 'A'
      || z === 3 && gridItem !== 'S'
    ) {
      southwestCheck = false;
      break;
    }
  }
  if(southwestCheck) xmasCount++; 

  return xmasCount;
}

console.log("D4 - P1: XMAS COUNT", globalXmasCount)