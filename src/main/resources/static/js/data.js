/* ==========================================================
   COS212 DFS Tutor — tree + question bank
   ========================================================== */

// The BST used throughout the quiz.
const TREE = {
  value: 50,
  left: {
    value: 30,
    left: { value: 20 },
    right: { value: 40 }
  },
  right: {
    value: 70,
    left: { value: 60 },
    right: { value: 80 }
  }
};

// Node positions for the SVG (viewBox 0 0 400 240).
const NODE_POS = {
  50: [200, 40],
  30: [110, 125], 70: [290, 125],
  20: [60, 205], 40: [160, 205], 60: [240, 205], 80: [340, 205]
};

const EDGES = [[50, 30], [50, 70], [30, 20], [30, 40], [70, 60], [70, 80]];

/*
  Each question:
  - tag, prompt, options [{key, text}], answer (key)
  - why: explanation of the correct answer
  - wrong: { key: misconception explanation }
  - hints: three progressive hints
  - concept: short name of the concept (shown on the summary page if missed)
  - review: recommended review text
  - tree: { visited: [...], current: n } or null
  - stepFocus: index of the worked-example step to open at
*/
const QUESTIONS = [
  {
    tag: "UNDERSTANDING DFS",
    prompt: "Which data structure does an iterative depth-first search use to decide which node to visit next?",
    options: [
      { key: "A", text: "Queue" },
      { key: "B", text: "Stack" },
      { key: "C", text: "Priority queue" },
      { key: "D", text: "Hash table" }
    ],
    answer: "B",
    why: "DFS always continues from the most recently discovered node. A stack is last-in, first-out (LIFO), so the node pushed last is popped first.",
    wrong: {
      A: "A queue is first-in, first-out (FIFO). That gives level-by-level order, which is breadth-first search, not DFS.",
      C: "A priority queue orders by a key (e.g. distance), which is used in Dijkstra's algorithm, not plain DFS.",
      D: "A hash table can record which nodes were visited, but it does not decide the visiting order."
    },
    hints: [
      "DFS goes as deep as possible before backing up.",
      "The node to explore next is the one you discovered most recently.",
      "Which structure is last-in, first-out?"
    ],
    concept: "DFS uses a stack (LIFO)",
    review: "Revisit how a LIFO stack makes DFS go deep before going wide.",
    tree: null,
    stepFocus: 0
  },
  {
    tag: "UNDERSTANDING DFS",
    prompt: "After visiting node 30, which node does a left-first DFS visit next?",
    options: [
      { key: "A", text: "Node 20" },
      { key: "B", text: "Node 70" },
      { key: "C", text: "Node 40" },
      { key: "D", text: "Node 50" }
    ],
    answer: "A",
    why: "Left-first DFS goes deeper before moving across the tree. After 30, its left child 20 is visited next.",
    wrong: {
      B: "70 is at the same level as 30. Left-first DFS explores the left child first, so it visits 20 before moving across the tree.",
      C: "40 is 30's right child. A left-first DFS visits the left child (20) before the right child.",
      D: "50 has already been visited. DFS does not revisit nodes; it continues downward from 30."
    },
    hints: [
      "Which item is at the top of the stack?",
      "After visiting 30, we push its right child 40 and then its left child 20.",
      "The next node is 20 because it was pushed last."
    ],
    concept: "Following the DFS visit order",
    review: "Revisit the step-by-step stack animation and practise how DFS backtracks.",
    tree: { visited: [50, 30], current: 30 },
    stepFocus: 2
  },
  {
    tag: "TRAVERSAL ORDERS",
    prompt: "What is the pre-order traversal of the tree shown?",
    options: [
      { key: "A", text: "20, 30, 40, 50, 60, 70, 80" },
      { key: "B", text: "50, 30, 70, 20, 40, 60, 80" },
      { key: "C", text: "50, 30, 20, 40, 70, 60, 80" },
      { key: "D", text: "20, 40, 30, 60, 80, 70, 50" }
    ],
    answer: "C",
    why: "Pre-order visits Node → Left → Right. Start at 50, go fully down the left subtree (30, 20, 40), then the right subtree (70, 60, 80).",
    wrong: {
      A: "That is in-order (Left → Node → Right). Pre-order visits the node before its children.",
      B: "That is level-order (breadth-first). Pre-order finishes the whole left subtree before visiting 70.",
      D: "That is post-order (Left → Right → Node). Pre-order visits the root first, not last."
    },
    hints: [
      "Pre-order means the node is processed before its children.",
      "The first node is the root, 50.",
      "Finish the entire left subtree of 50 before touching 70."
    ],
    concept: "Pre-order traversal",
    review: "Compare the pre-, in- and post-order sequences on the same tree.",
    tree: { visited: [], current: 50 },
    stepFocus: 0
  },
  {
    tag: "TRAVERSAL ORDERS",
    prompt: "Why does an in-order traversal of this tree output the values in ascending order?",
    options: [
      { key: "A", text: "Because the tree is balanced" },
      { key: "B", text: "Because DFS always visits the smallest value first" },
      { key: "C", text: "Because the stack sorts the values" },
      { key: "D", text: "Because it is a BST: left < node < right" }
    ],
    answer: "D",
    why: "In a BST every value in the left subtree is smaller than the node and every value in the right subtree is larger. In-order visits Left → Node → Right, so values come out sorted.",
    wrong: {
      A: "Balance affects height, not ordering. An unbalanced BST still gives sorted in-order output.",
      B: "DFS starts at the root (50), not the smallest value. The sorted order comes from the BST rule.",
      C: "A stack only reverses insertion order; it does not sort anything."
    },
    hints: [
      "Look at where smaller and larger values sit relative to each node.",
      "In-order processes the left subtree, then the node, then the right subtree.",
      "What rule does a binary search tree enforce?"
    ],
    concept: "In-order traversal and the BST ordering rule",
    review: "Reflect on how the BST ordering rule interacts with in-order traversal.",
    tree: { visited: [], current: null },
    stepFocus: 0
  },
  {
    tag: "TRAVERSAL ORDERS",
    prompt: "In a post-order traversal of this tree, which node is output last?",
    options: [
      { key: "A", text: "Node 80" },
      { key: "B", text: "Node 50" },
      { key: "C", text: "Node 20" },
      { key: "D", text: "Node 70" }
    ],
    answer: "B",
    why: "Post-order visits Left → Right → Node. The root can only be output after both of its subtrees are finished, so 50 is always last.",
    wrong: {
      A: "80 is the last node in in-order and pre-order, but in post-order the root comes after it.",
      C: "20 is output first in post-order, since it is the leftmost leaf.",
      D: "70 is output after its children 60 and 80, but before its parent 50."
    },
    hints: [
      "Post-order processes a node after its children.",
      "Which node is the parent of every other node?",
      "The root has to wait for both subtrees."
    ],
    concept: "Post-order traversal",
    review: "Trace post-order on the tree and note when each parent is output.",
    tree: { visited: [], current: null },
    stepFocus: 0
  },
  {
    tag: "EXPLICIT STACK",
    prompt: "An iterative DFS starts at 50 and has visited 50, 30 and 20. Which node is popped from the stack next?",
    options: [
      { key: "A", text: "Node 70" },
      { key: "B", text: "Node 30" },
      { key: "C", text: "Node 40" },
      { key: "D", text: "Node 60" }
    ],
    answer: "C",
    why: "20 is a leaf, so nothing new is pushed. The stack now holds [70, 40] with 40 on top, so DFS backtracks to 40.",
    wrong: {
      A: "70 is in the stack, but beneath 40. It was pushed earlier (after visiting 50), so it comes out later.",
      B: "30 was already popped and visited. DFS never pushes a visited node back onto the stack.",
      D: "60 has not been pushed yet; it only enters the stack once 70 is visited."
    },
    hints: [
      "20 is a leaf — does it push anything?",
      "When 30 was visited it pushed 40, then 20. 20 was popped already.",
      "The stack is now [70, 40]. Which one is on top?"
    ],
    concept: "Backtracking with an explicit stack",
    review: "Watch the stack after each pop to see how DFS backtracks from a leaf.",
    tree: { visited: [50, 30, 20], current: 20 },
    stepFocus: 3
  }
];

/*
  Worked example: iterative pre-order DFS from 50.
  Pop a node, visit it, push right child then left child (so left is on top).
*/
function buildDfsSteps(root) {
  const steps = [];
  const stack = [root];
  const visited = [];
  steps.push({
    stack: stack.map(n => n.value),
    visited: [],
    current: null,
    note: "Start: push the root 50 onto the stack."
  });
  while (stack.length) {
    const node = stack.pop();
    visited.push(node.value);
    const pushed = [];
    if (node.right) { stack.push(node.right); pushed.push(node.right.value); }
    if (node.left) { stack.push(node.left); pushed.push(node.left.value); }
    let note = `Pop ${node.value} and visit it. `;
    if (pushed.length === 2) {
      note += `Push right child ${pushed[0]}, then left child ${pushed[1]} — so ${pushed[1]} is on top.`;
    } else if (pushed.length === 1) {
      note += `Push child ${pushed[0]}.`;
    } else {
      note += stack.length
        ? `${node.value} is a leaf — backtrack to ${stack[stack.length - 1].value} on top of the stack.`
        : `${node.value} is a leaf and the stack is empty — DFS is complete.`;
    }
    steps.push({
      stack: stack.map(n => n.value),
      visited: visited.slice(),
      current: node.value,
      note
    });
  }
  return steps;
}

const DFS_STEPS = buildDfsSteps(TREE);
