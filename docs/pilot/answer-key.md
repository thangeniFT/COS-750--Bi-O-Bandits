# Pre/post-test answer key (ID appendix D)

Each question scores 1 (correct) or 0. Accept any separator between values (commas, spaces, arrows).

## Form 1: tree built from 40, 20, 60, 10, 30, 50, 70

```
        40
      /    \
    20      60
   /  \    /  \
  10  30  50  70
```

| Q | Answer | Mark as correct if |
|---|---|---|
| 1 | Stack | "stack" or "LIFO stack". "Queue" or "recursion" alone gets 0. Accept "the call stack (recursion)". |
| 2 | Pre-order: 40, 20, 10, 30, 60, 50, 70 | All seven in this exact order |
| 3 | In-order: 10, 20, 30, 40, 50, 60, 70 | All seven in this exact order |
| 4 | Search for right-most leaf (70): 40, 20, 10, 30, 60, 50, 70 | All seven in order. "40, 60, 70" (BST search path) gets **0**: that is binary search, not DFS. |
| 5 | Depth-first means going as deep as possible along one path before backtracking to try another | Mentions going deep along one path before trying another (ID wording) |

## Form 2: tree built from 35, 15, 55, 5, 25, 45, 65

```
        35
      /    \
    15      55
   /  \    /  \
  5   25  45  65
```

| Q | Answer | Mark as correct if |
|---|---|---|
| 1 | Stack | As Form 1 |
| 2 | Pre-order: 35, 15, 5, 25, 55, 45, 65 | Exact order |
| 3 | In-order: 5, 15, 25, 35, 45, 55, 65 | Exact order |
| 4 | Search for right-most leaf (65): 35, 15, 5, 25, 55, 45, 65 | Exact order. "35, 55, 65" gets 0. |
| 5 | As Form 1 | As Form 1 |

These orders match the app's `DepthFirstSearch` (pre-order, left child before right).

> Note for the write-up: on both forms the answer to Q4 is the same sequence as Q2, because the
> right-most leaf is the last node in pre-order. A student who gets Q2 right will almost always get
> Q4 right, so Q4 adds little separate evidence for LO4. Mention this as a limitation of the
> instrument in the findings.
