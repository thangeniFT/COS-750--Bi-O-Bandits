package za.ac.up.dfstutor.model;

import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Objects;

/**
 * Depth-first search and depth-first traversal over a {@link BinarySearchTree}, recording every
 * step so the browser can play the walk back.
 *
 * <p>This class never changes the tree, holds no state between calls, and has no Spring
 * dependencies, so it can be tested with a plain {@code new DepthFirstSearch(new StepExplanations())}.
 *
 * <p><b>Business rules this class must follow</b> (SE document, section 5.3):
 * <ul>
 *   <li>BR-6: every DFS starts at the root.</li>
 *   <li>BR-7: go as deep as possible along one branch before backtracking.</li>
 *   <li>BR-8: the left child is always explored before the right child.</li>
 *   <li>BR-9: a search checks each node when it is first reached (pre-order) and stops as soon as
 *       the target is found or the stack is empty.</li>
 *   <li>BR-10: only real nodes are counted as visited, never {@code null} children.</li>
 *   <li>BR-11: DFS does <em>not</em> use the BST ordering to skip subtrees.</li>
 * </ul>
 *
 * <p><b>Status:</b> skeleton. {@link #search} is backlog ticket <b>B-01</b> and {@link #traverse}
 * is ticket <b>B-02</b>. Until they are done, both throw {@link UnsupportedOperationException},
 * which the API turns into HTTP 501 "not implemented yet". The tests that define the expected
 * behaviour are already written in {@code DepthFirstSearchTest}; remove the {@code @Disabled}
 * annotation for your ticket and make them pass.
 */
public final class DepthFirstSearch {

    private final StepExplanations explanations;

    /**
     * Creates the algorithm.
     *
     * @param explanations produces the learner-facing sentence recorded with each step
     */
    public DepthFirstSearch(StepExplanations explanations) {
        this.explanations = Objects.requireNonNull(explanations, "explanations");
    }

    /**
     * Searches the tree for {@code target} using iterative, pre-order DFS with an explicit stack.
     *
     * <p>The stack is explicit (rather than hidden in recursion) because the stack is exactly what
     * the lesson wants students to see.
     *
     * <p><b>Algorithm</b> (the same four steps the student reads on screen 4d):
     * <ol>
     *   <li>Push the root onto the stack (skip this if the tree is empty).</li>
     *   <li>While the stack is not empty, pop the top node and visit it.</li>
     *   <li>If its value equals the target, record the step and return {@code found()}.
     *       Otherwise push its right child, then its left child, skipping {@code null} children,
     *       and record the step. Pushing right first leaves the left child on top, so left is
     *       explored first (BR-8).</li>
     *   <li>If the stack runs empty, return {@code notFound()}.</li>
     * </ol>
     *
     * <p><b>Expected results on the example tree</b> (inserted as 50, 30, 70, 20, 40, 60, 80):
     * <ul>
     *   <li>target 60: found, visit order 50, 30, 20, 40, 70, 60; stack after each step (top first):
     *       [30, 70], [20, 40, 70], [40, 70], [70], [60, 80], [80]</li>
     *   <li>target 65: not found, all 7 nodes visited</li>
     *   <li>target 50: found after 1 visit</li>
     *   <li>empty tree: not found, 0 visits, no steps</li>
     * </ul>
     *
     * @param tree   the tree to search; it is not modified
     * @param target the value to look for
     * @return the result with {@link TraversalOrder#PRE_ORDER}, the visit order and every step
     * @throws NullPointerException if {@code tree} is {@code null}
     */
    public DfsResult search(BinarySearchTree tree, int target) {
        Objects.requireNonNull(tree, "tree");

        // TODO(B-01): implement the iterative DFS search described above.
        //  Hints:
        //   - Use java.util.ArrayDeque as the stack: push() adds to the top, pop() removes the top,
        //     and iterating over it goes from top to bottom, which is the order the API reports.
        //   - Record each visit with:
        //       result.visit(current.getValue(), valuesTopFirst(stack), explanations.searchVisit(...))
        //     AFTER pushing the children, so that stackAfter shows the stack at the end of the step.
        //   - For the target node use explanations.searchFound(...) and do not push its children.
        //   - Then delete the throw below and enable DepthFirstSearchTest.Search.
        //  Reference listing: SE document, section 9, listing 1.
        throw new UnsupportedOperationException(
                "DFS search is not implemented yet (backlog ticket B-01).");
    }

    /**
     * Visits every node of the tree in the given depth-first order.
     *
     * <p>Implement this recursively: the three orders then differ only in where a single
     * "record this node" line sits relative to the two recursive calls (SE document, listing 2).
     *
     * <p>For a traversal, each step's {@code stackAfter} is the <em>recursion (call) stack</em>:
     * the path from the root down to the node being recorded, top first. For example, when
     * in-order records 20 on the example tree, the path is {@code [20, 30, 50]}.
     *
     * <p><b>Expected visit orders on the example tree:</b>
     * <ul>
     *   <li>pre-order: 50, 30, 20, 40, 70, 60, 80</li>
     *   <li>in-order: 20, 30, 40, 50, 60, 70, 80 (sorted, for any BST)</li>
     *   <li>post-order: 20, 40, 30, 60, 80, 70, 50</li>
     * </ul>
     *
     * @param tree  the tree to traverse; it is not modified
     * @param order which depth-first order to record
     * @return the result, finished with {@code completed()}: no target and {@code found = false}
     * @throws NullPointerException if {@code tree} or {@code order} is {@code null}
     */
    public DfsResult traverse(BinarySearchTree tree, TraversalOrder order) {
        Objects.requireNonNull(tree, "tree");
        Objects.requireNonNull(order, "order");

        // TODO(B-02): implement the recursive traversal described above.
        //  Suggested shape:
        //    DfsResult.Builder result = DfsResult.builder(order, null);
        //    walk(tree.getRoot(), order, new ArrayDeque<>(), result);
        //    return result.completed();
        //  where walk(...) pushes the node's value onto the path, records it before / between /
        //  after the two recursive calls depending on the order, and pops it again at the end.
        //  Use explanations.traversalVisit(...) for the wording. Then enable
        //  DepthFirstSearchTest.Traversal.
        throw new UnsupportedOperationException(
                "DFS traversal is not implemented yet (backlog ticket B-02).");
    }

    /**
     * Copies the values on a stack of nodes into a list, top first, ready to store in a
     * {@link DfsStep}.
     *
     * <p>An {@link java.util.ArrayDeque} used with {@code push}/{@code pop} iterates from the top of
     * the stack to the bottom, so a simple loop gives the order the API expects.
     *
     * @param stack the algorithm's working stack (not modified)
     * @return the node values from top to bottom
     */
    static List<Integer> valuesTopFirst(Deque<TreeNode> stack) {
        List<Integer> values = new ArrayList<>(stack.size());
        for (TreeNode node : stack) {
            values.add(node.getValue());
        }
        return values;
    }
}
