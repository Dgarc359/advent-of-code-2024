
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
  dequeue(): T | undefined {
    return this.internalStorage.shift();
  }

  // return size of queue
  size(): number {
    return this.internalStorage.length;
  }
}