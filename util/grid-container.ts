import { CoordinateXY } from "./types";

import fs from "node:fs";
/**
 * A class representing a grid container that holds a 2D array of items.
 *
 * @generic A - The type of the items in the grid.
 * @generic T - The type of the response when an out-of-bounds access occurs.
 */
export class GridContainer<A, T> {
  grid: A[][] = [];

  public yLength: number = null!;
  public xLength: number = null!;

  outOfBoundsResponse: T;

  private index: Map<unknown, CoordinateXY> = new Map();

  constructor(outOfBoundsResponse: T) {
    this.outOfBoundsResponse = outOfBoundsResponse;
  }

  setHeight(yLength: number) {
    if (this.yLength) {
      this.yLength = Math.max(yLength, this.yLength);
    } else {
      this.yLength = yLength;
    }
  }

  setWidth(xLength: number) {
    if (this.xLength) {
      this.xLength = Math.max(xLength, this.xLength);
    } else {
      this.xLength = xLength;
    }
  }

  pushToGrid(row: A[]) {
    this.grid.push(row);
  }

  getCoordGridItem(coord: CoordinateXY): A | T {
    return this.getGridItem(coord.x, coord.y);
  }

  getGridItem(x: number, y: number): A | T {
    if (x < 0 || x >= this.xLength) return this.outOfBoundsResponse;
    if (y < 0 || y >= this.yLength) return this.outOfBoundsResponse;

    try {
      const yRow = this.grid[y];
      // console.debug(`tried to grab grid item from yRow: ${yRow}`);
      const xElem = yRow[x];
      // console.log(`xElem with x: ${x} y: ${y} index is ${xElem}`);
      return xElem;
    } catch (e) {
      console.error(`something happened trying to access x: ${x} y: ${y}`);
    }

    return this.outOfBoundsResponse;
  }

  // this will help us retrieve specific node values we might
  // want to find at a later point
  // during `setCoordGridItem`, we can declare the key for our index
  // for later retrieval
  indexOf(key: unknown) {
    return this.index.get(key)
  }

  setCoordGridItem(coord: CoordinateXY, item: A, indexKey: unknown = undefined): void {
    // if no index key is passed, we're not doing explicit indexing
    // of our grid container
    this.index.set(indexKey!, coord)
    return this.setGridItem(coord.x, coord.y, item);
  }

  setGridItem(x: number, y: number, item: A): void {
    const gridItem = this.getGridItem(x, y);
    if (gridItem && gridItem !== this.outOfBoundsResponse) {
      this.grid[y][x] = item;
    }
  }

  getInnerGrid(): A[][] {
    return this.grid;
  }

  // this currently assumes that each item is a STRING
  logCurrentGrid(
    stringifyForEachRow?: (row: A[], i: number, grid: A[][]) => string
  ) {
    console.clear();
    // const xColumnHeaders = `   ` + Array(this.xLength).fill(1).map((val, i) => i).join('') + '\n'
    const strToLog = this.grid
      .map((yRows, i, g) =>
        stringifyForEachRow
          ? stringifyForEachRow(yRows, i, g)
          : `${i} - ` + yRows.join("")
      )
      .join("\n");
    console.log(strToLog);
  }

  // callback can be given when it's unclear how to stringify whatever's being
  // contained in the grid container
  // useful when storing objects
  // the whole grid will be given as as argument and you're expected
  // to declare how that grid will look
  saveMapGridToFile(path: string, callback?: (grid: A[][]) => string) {
    if (callback) {
      fs.writeFileSync(path, callback(this.grid));
    } else {
      fs.writeFileSync(
        path,
        this.grid.map((yRows, i) => yRows.join("")).join("\n")
      );
    }
  }

  getWidth() {
    return this.xLength;
  }

  getHeight() {
    return this.yLength;
  }

  forEach(callback: (el: A, i: number, arr: A[][]) => void) {
    this.grid.forEach((row, y, overallGrid) => {
      row.forEach((el, x, yRow) => {
        callback(el, y + x, this.grid);
      });
    });
  }
}
