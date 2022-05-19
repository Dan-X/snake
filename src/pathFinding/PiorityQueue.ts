// https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
const top = 0;
const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number)  => (i << 1) + 1;
const right = (i: number)  => (i + 1) << 1;

// const defaultComparator = (a: number, b: number) => a>b;
export class PriorityQueue<T> {
  _heap: T[];
  _comparator: (a: T, b: T) => boolean;
  constructor(comparator = (a: T, b: T) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  get size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size === 0;
  }
  peek() {
    return this._heap[top];
  }
  push(...values:T[]) {
    values.forEach((value) => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size;
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value: T) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i: number, j: number) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp(nodeIdx?: number) {
    let node = nodeIdx || (this.size - 1);
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  _siftDown(nodeIdx?: number) {
    let node = nodeIdx || top;
    while (
      (left(node) < this.size && this._greater(left(node), node)) ||
      (right(node) < this.size && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
