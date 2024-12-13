

export class GridContainer<A,T> {
  grid: A[][] = [];

  public yLength: number = null!;
  public xLength: number = null!;
  
  outOfBoundsResponse: T;

  constructor(outOfBoundsResponse: T) {
    this.outOfBoundsResponse = outOfBoundsResponse
  }

  setYLength(yLength: number) {
    this.yLength = yLength;
  }

  setXLength(xLength: number) {
    this.xLength = xLength
  }

  pushToGrid(row: A[]) {
    this.grid.push(row)
  }

  getGridItem(x: number, y: number): A | T {
    if(x < 0 || x >= this.xLength) return this.outOfBoundsResponse;
    if(y < 0 || y >= this.yLength) return this.outOfBoundsResponse;


    try {
      const yRow = this.grid[y];
      return this.grid[y][x];
    } catch (e) {
      console.error(`something happened trying to access x: ${x} y: ${y}`)
    }

    return this.outOfBoundsResponse;
  }
}