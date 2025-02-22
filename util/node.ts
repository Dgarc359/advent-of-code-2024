import { CoordinateXY } from "./types";

// simple node class for the grid
export class Node {
  prev: Node = undefined!;
  cost: number = Infinity;
  coord: CoordinateXY;
  value: any;

  constructor(v: any, coord: CoordinateXY) {
    this.value = v;
    this.coord = coord;
  }
  setPrevious(n: Node) {
    this.prev = n;
  }
  getPrevious() {
    return this.prev;
  }

  setCost(c: number) {
    this.cost = c;
  }
  getCost() {
    return this.cost;
  }

  setValue(v: any) {
    this.value = v;
  }
  getValue() {
    return this.value;
  }

  setCoord(c: CoordinateXY) {
    this.coord = c;
  }
}