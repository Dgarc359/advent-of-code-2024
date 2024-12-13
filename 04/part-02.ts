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
    if(currentChar === 'A') {
      console.log("hit A char")
      globalXmasCount += countXmas(x, y, grid)
    }
  }
}

// this function should only be called if current char in grid is X
// therefore, we only need to check that the next chars are M A S
// also... sometimes the prettiest solution is the one that was actually made..
function countXmas(currX: number, currY: number, grid: GridContainer<GridTile, OutOfBoundsResponse>): number {
  
  let xmasCount = 0;

  // checking the \ diagonal, calling it backslash for the shape
  const northwestChar = grid.getGridItem(currX - 1, currY - 1)
  const southeastChar = grid.getGridItem(currX + 1, currY + 1)
  let backslashCheck = false;
  if((northwestChar === 'M' && southeastChar === 'S')
    || (northwestChar === 'S' && southeastChar === 'M')
  ) {
    backslashCheck = true;
  }



  // checking the / diagonal, calling it backslash for the shape
  const northeastChar = grid.getGridItem(currX + 1, currY - 1)
  const southwestChar = grid.getGridItem(currX - 1, currY + 1)
  let forwardSlashCheck = false;
  if((northeastChar === 'M' && southwestChar === 'S')
    || (northeastChar === 'S' && southwestChar === 'M')
  ) {
    forwardSlashCheck = true;
  }

  if(forwardSlashCheck && backslashCheck) xmasCount++;

  return xmasCount;
}

console.log("D4 - P2: XMAS COUNT", globalXmasCount)