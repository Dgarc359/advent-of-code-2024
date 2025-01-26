
// FIFO
export class Queue<T> {
  internalStorage: T[] = [];

  constructor(initialStorage?: T[]) {
    if(initialStorage) {
      this.internalStorage = initialStorage
    }
  }

  // add an item to the end of the queue
  enqueue(item: T): void {
    this.internalStorage.push(item);
  }

  // remove an item from the queue, return the removed item, or undefined if no items in queue
  dequeue(idx?: number): T | undefined {
    if(idx) {
      return this.internalStorage.splice(idx, 1)[0]
    }
    return this.internalStorage.shift();
  }

  replace(idx: number, el: T) {
    const old = this.internalStorage[idx]
    this.internalStorage[idx] = el

    return old;
  }

  // return size of queue
  size(): number {
    return this.internalStorage.length;
  }

  forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) {
    return this.internalStorage.forEach(callbackfn, thisArg)
  }
}