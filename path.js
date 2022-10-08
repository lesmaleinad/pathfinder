function getDirs(diagonals = false) {
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].concat(
    diagonals
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : []
  );
}

let dirs = getDirs();

const Colors = [
  ["lightgrey", 1],
  ["yellow", 3],
  ["red", 10],
];

function changeColorCost() {
  Colors[0][1] = parseInt(document.getElementById("lightgreyCost").value);
  Colors[1][1] = parseInt(document.getElementById("yellowCost").value);
  Colors[2][1] = parseInt(document.getElementById("redCost").value);
}

class Node {
  bestCost = Infinity;

  get color() {
    return this.colorCost[0];
  }

  get cost() {
    return this.colorCost[1];
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.colorCost = Colors[Math.floor(Math.random() * Colors.length)];
  }
}

class MinCostNodeQueue {
  constructor(size) {
    this.qArr = new Array(size);
    this.size = 0;
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChild(i) {
    return i * 2 + 1;
  }

  rightChild(i) {
    return i * 2 + 2;
  }

  bestCostOf(i) {
    return this.qArr[i].bestCost;
  }

  switch(i, ii) {
    const temp = this.qArr[i];
    this.qArr[i] = this.qArr[ii];
    this.qArr[ii] = temp;
  }

  shiftUp(i) {
    while (i > 0 && this.bestCostOf(this.parent(i)) > this.bestCostOf(i)) {
      this.switch(this.parent(i), i);
      i = this.parent(i);
    }
  }

  shiftDown(i) {
    let lowestCostIndex = i;
    do {
      i = lowestCostIndex;
      for (const childIndex of [this.leftChild(i), this.rightChild(i)]) {
        if (
          childIndex <= this.size &&
          this.bestCostOf(childIndex) < this.bestCostOf(lowestCostIndex)
        ) {
          lowestCostIndex = childIndex;
        }
      }

      this.switch(i, lowestCostIndex);
    } while (lowestCostIndex !== i);
  }

  invalid(i) {
    return [this.leftChild(i), this.rightChild(i)].some((childIndex) => {
      return (
        childIndex <= this.size &&
        (this.bestCostOf(childIndex) < this.bestCostOf(i) ||
          this.invalid(childIndex))
      );
    });
  }

  insert(node) {
    this.qArr[this.size] = node;
    this.shiftUp(this.size);
    this.size++;
  }

  extract() {
    this.size--;
    const result = this.qArr[0];
    this.qArr[0] = this.qArr[this.size];
    this.shiftDown(0);
    return result;
  }
}

class NodeGrid {
  constructor() {
    this.resetNodeGrid();
  }

  get sizeX() {
    return this.nodes[0].length;
  }

  get sizeY() {
    return this.nodes.length;
  }

  resetNodeGrid() {
    const sizeX = parseInt(document.getElementById("inputX").value);
    const sizeY = parseInt(document.getElementById("inputY").value);
    const grid = [];
    for (let y = 0; y < sizeY; y++) {
      grid.push([]);
      for (let x = 0; x < sizeX; x++) {
        grid[y].push(new Node(x, y));
      }
    }
    this.nodes = grid;
    this.resetHTML();
  }

  resetHTML() {
    const nodeGridHTML = document.getElementById("nodeGrid");
    nodeGridHTML.replaceChildren();

    let rowIndex = 0;
    for (const row of this.nodes) {
      const rowHTML = document.createElement("div");
      rowHTML.className = `row row-${rowIndex}`;
      nodeGridHTML.append(rowHTML);

      rowIndex++;

      for (const node of row) {
        const nodeHTML = document.createElement("li");
        nodeHTML.className = "node";
        nodeHTML.id = `n${node.x}-${node.y}`;
        nodeHTML.style.backgroundColor = node.color;
        rowHTML.append(nodeHTML);
      }
    }

    document.getElementById("end").innerText = `${this.sizeX - 1}-${
      this.sizeY - 1
    }`;
  }

  getNeighbors(node) {
    const neighbors = [];
    let x, y;

    for (const [dx, dy] of dirs) {
      x = node.x + dx;
      y = node.y + dy;

      if (x < 0 || this.sizeX <= x) {
        continue;
      }

      if (y < 0 || this.sizeY <= y) {
        continue;
      }

      neighbors.push(this.nodes[y][x]);
    }

    return neighbors;
  }

  findPath(fromX, fromY, toX, toY) {
    const startNode = this.nodes[fromY][fromX];
    startNode.bestCost = startNode.cost;

    let currentNode = startNode;
    const q = new MinCostNodeQueue();
    q.insert(startNode);

    while (q.size > 0) {
      currentNode = q.extract();

      if (currentNode.x === toX && currentNode.y === toY) {
        return currentNode;
      } else {
        for (const neighbor of this.getNeighbors(currentNode)) {
          if (neighbor.bestCost > currentNode.bestCost + neighbor.cost) {
            neighbor.bestCost = currentNode.bestCost + neighbor.cost;
            neighbor.bestNode = currentNode;
            q.insert(neighbor);
          }
        }
      }
    }
  }
}

let nodeGrid = new NodeGrid();

document
  .querySelectorAll(".gridSize")
  .forEach((elem) =>
    elem.addEventListener("change", () => nodeGrid.resetNodeGrid())
  );

document
  .querySelectorAll(".nodeCost")
  .forEach((elem) => elem.addEventListener("change", () => changeColorCost()));

document.getElementById("randomCost").onclick = () => nodeGrid.resetNodeGrid();

document.getElementById("diag").addEventListener("change", (e) => {
  dirs = getDirs(e.target.checked);
});

document.getElementById("findPath").onclick = () => {
  for (const row of nodeGrid.nodes) {
    for (const node of row) {
      node.bestCost = Infinity;
      document.getElementById(`n${node.x}-${node.y}`).classList.remove("path");
    }
  }

  let node = nodeGrid.findPath(0, 0, nodeGrid.sizeX - 1, nodeGrid.sizeY - 1);

  while (node) {
    document.getElementById(`n${node.x}-${node.y}`).classList.add("path");
    node = node.bestNode;
  }
};
