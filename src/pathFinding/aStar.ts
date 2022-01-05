import { PriorityQueue } from "./PiorityQueue";

// const checkCoordExists = (obstacles: [number, number][]) => {
//   return (c: [number, number]) => obstacles.some((block) => block[0] === c[0] && block[1] === c[1]);
// };
const getManhattanDistance = (p1: [number, number], p2: [number, number]) => {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
};

class Node {
  // readonly coord: [number, number];
  static boardSize: number = 100;
  static obstacles: [number, number][] = [];
  static isObstacle(coord: [number, number]) {
    return !Node.obstacles.some((block) => block[0] === coord[0] && block[1] === coord[1]);
  }
  static goal: [number, number] = [Node.boardSize, Node.boardSize];

  readonly f: number;
  readonly h: number;

  constructor(public last: Node | null, public readonly coord: [number, number], public g: number = 999) {
    this.h = getManhattanDistance(coord, Node.goal);
    this.f = g + this.h;
  }

  private _produceNewNeighbor(coord: [number, number]) {
    return new Node(this, [coord[0], coord[1]], this.g + 1);
  }
  get neighbours() {
    const neighbours = [];
    //up
    (this.coord[1] - 1) >= 0 &&
      Node.isObstacle([this.coord[0], this.coord[1] - 1]) &&
      neighbours.push(this._produceNewNeighbor([this.coord[0], this.coord[1] - 1]));
    //down
    (this.coord[1] + 1) < Node.boardSize &&
      Node.isObstacle([this.coord[0], this.coord[1] + 1]) &&
      neighbours.push(this._produceNewNeighbor([this.coord[0], this.coord[1] + 1]));
    //left
    (this.coord[0] - 1) >= 0 &&
      Node.isObstacle([this.coord[0] - 1, this.coord[1]]) &&
      neighbours.push(this._produceNewNeighbor([this.coord[0] - 1, this.coord[1]]));
    //right
    (this.coord[0] + 1) < Node.boardSize &&
      Node.isObstacle([this.coord[0] + 1, this.coord[1]]) &&
      neighbours.push(this._produceNewNeighbor([this.coord[0] + 1, this.coord[1]]));
    return neighbours;
  }
}

class OpenQueue extends PriorityQueue<Node> {
  constructor() {
    super((a: Node, b: Node) => a.f < b.f);
  }
  get openNodes() {
    return this._heap
  }
  _replaceNode(foundIdx: number, newNode: Node) {
    // const foundIdx = this._heap.findIndex(
    //   (node) => node.coord[0] === newNode.coord[0] && node.coord[1] === newNode.coord[1]
    // );
    const replacedValue = this._heap[foundIdx];
    if (replacedValue.f === newNode.f) return replacedValue;
    this._heap[foundIdx] = newNode;
    if (this._comparator(replacedValue, newNode)) {
      this._siftDown(foundIdx);
    }else {
      this._siftUp(foundIdx)
    }
    return replacedValue;
  }
  addNode(newNode: Node) {
    const foundIdx = this._heap.findIndex(
      (node) => node.coord[0] === newNode.coord[0] && node.coord[1] === newNode.coord[1]
    );
    if (foundIdx === -1) {
      this.push(newNode);
    }else{
      this._replaceNode(foundIdx, newNode);
    }
  }
}

export const aStar = (
  start: [number, number],
  end: [number, number],
  boardSize: number,
  obstacles?: [number, number][]
) => {
  const openQueue = new OpenQueue();
  const closedNodes = [] as Node[];
  // initialize the Node class
  Node.boardSize = boardSize;
  Node.obstacles = obstacles || [];
  Node.goal = end;

  // add start to the openQueue
  openQueue.push(new Node(null, start, 0));
  
  // step
  let step = 0
  let currentNode = openQueue.pop();
  while (step < 1000000 && (currentNode.coord[0]!==end[0] || currentNode.coord[1]!== end[1])) {
    console.log('openQueueLength: ', openQueue.size)
    const neighbours = currentNode.neighbours;
    neighbours.forEach(node => {
      if(!closedNodes.some(closedNode => closedNode.coord[0]===node.coord[0] && closedNode.coord[1]===node.coord[1])) {
        openQueue.addNode(node)
      }
    });
    closedNodes.push(currentNode);
    if(openQueue.isEmpty()) {
      return { path: [], openNodes: openQueue.openNodes, closedNodes};
    }
    currentNode = openQueue.pop();
  }
  //traceBack
  if (currentNode.coord[0] !== end[0] || currentNode.coord[1] !== end[1]) {
    return { path: [], openNodes: openQueue.openNodes, closedNodes};
  }
  let path = [currentNode] as Node[];
  let last = path[path.length-1].last;
  step = 0
  while (step < 1000000 && last) {
    path.push(last)
    last = path[path.length-1].last;
  }
  return { path, openNodes: openQueue.openNodes, closedNodes};

};

export const aStarStepwise =  (
  stepLim: number,
  start: [number, number],
  end: [number, number],
  boardSize: number,
  obstacles?: [number, number][]
) => {
  // console.log("A* pathfinding!")
  const openQueue = new OpenQueue();
  const closedNodes = [] as Node[];
  // initialize the Node class
  Node.boardSize = boardSize;
  Node.obstacles = obstacles || [];
  Node.goal = end;

  // add start to the openQueue
  openQueue.push(new Node(null, start, 0));
  
  // step
  let step = 0
  let currentNode = openQueue.pop();
  while (step < stepLim && (currentNode.coord[0]!==end[0] || currentNode.coord[1]!== end[1])) {
    step++;
    const neighbours = currentNode.neighbours;
    neighbours.forEach(node => {
      if(!closedNodes.some(closedNode => closedNode.coord[0]===node.coord[0] && closedNode.coord[1]===node.coord[1])) {
        openQueue.addNode(node)
      }
    });
    closedNodes.push(currentNode);
    if(openQueue.isEmpty()) {
      return { path: [], openNodes: openQueue.openNodes, closedNodes, hasNextStep: false};
    }
    currentNode = openQueue.pop();
  }
  //traceBack
  if (currentNode.coord[0] !== end[0] || currentNode.coord[1] !== end[1]) {
    return { path: [], openNodes: openQueue.openNodes, closedNodes, hasNextStep: !(step<stepLim)};
  }
  let path = [currentNode] as Node[];
  let last = path[path.length-1].last;

  while (step < stepLim && last) {
    step++;
    path.push(last)
    last = path[path.length-1].last;
  }
  return { path, openNodes: openQueue.openNodes, closedNodes, hasNextStep: !(step<stepLim)};

};

// const path = aStar([1,1], [9,9], 10);
// console.log(path.map(node => node.coord))
