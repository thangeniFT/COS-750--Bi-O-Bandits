package za.ac.up.dfstutor.model;

import java.util.*;

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


    public DfsResult search(BinarySearchTree tree, int target) {
        Objects.requireNonNull(tree, "tree");
        DfsResult.Builder result = DfsResult.builder(TraversalOrder.PRE_ORDER, target);
        Deque<TreeNode> stack = new ArrayDeque<>();

        if (!tree.isEmpty()) {
            stack.push(tree.getRoot());
        }

        // Keep going until there is nothing left to explore.
        while (!stack.isEmpty()) {
            TreeNode current = stack.pop();

            if (current.getValue() == target) {
                result.visit(current.getValue(), valuesTopFirst(stack),
                    explanations.searchFound(current.getValue()));
                return result.found();
            }

            if (current.getRight() != null) {
                stack.push(current.getRight());
            }
            if (current.getLeft() != null) {
                stack.push(current.getLeft());
            }

            List<Integer> stackAfter = valuesTopFirst(stack);
            result.visit(current.getValue(), stackAfter,
                explanations.searchVisit(current, target, stackAfter));
        }

        return result.notFound();

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
     * @param stack the algorithm's working stack
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
