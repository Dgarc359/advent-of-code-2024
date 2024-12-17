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

  constructor(outOfBoundsResponse: T) {
    this.outOfBoundsResponse = outOfBoundsResponse;
  }

  setHeight(yLength: number) {
    if (this.yLength) {
      this.yLength = Math.max(yLength, this.yLength)
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

  getGridItem(x: number, y: number): A | T {
    if (x < 0 || x >= this.xLength) return this.outOfBoundsResponse;
    if (y < 0 || y >= this.yLength) return this.outOfBoundsResponse;

    try {
      const yRow = this.grid[y];
      console.debug(`tried to grab grid item from yRow: ${yRow}`);
      const xElem = yRow[x];
      console.log(`xElem with x: ${x} y: ${y} index is ${xElem}`);
      return xElem;
    } catch (e) {
      console.error(`something happened trying to access x: ${x} y: ${y}`);
    }

    return this.outOfBoundsResponse;
  }

  setGridItem(x: number, y: number, item: A): void {
    const gridItem = this.getGridItem(x, y)
    if (gridItem && gridItem !== this.outOfBoundsResponse) {
      this.grid[y][x] = item;
    }
  }

  getInnerGrid(): A[][] {
    return this.grid;
  }

  logCurrentGrid() {
    console.log(this.grid);
  }
}
