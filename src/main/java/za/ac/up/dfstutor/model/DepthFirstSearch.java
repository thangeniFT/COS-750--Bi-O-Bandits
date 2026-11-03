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

    public DfsResult traverse(BinarySearchTree tree, TraversalOrder order) {
        Objects.requireNonNull(tree, "tree");
        Objects.requireNonNull(order, "order");

        DfsResult.Builder result = DfsResult.builder(order, null);
        walk(tree.getRoot(), order, new ArrayDeque<>(), result);
        return result.completed();

    }

    private void walk(TreeNode node, TraversalOrder order, Deque<TreeNode> path, DfsResult.Builder result) {
        // Base case: an empty subtree has nothing to visit.
        if (node == null) {
            return;
        }

        path.push(node);

        if (order == TraversalOrder.PRE_ORDER) {
            record(node, order, path, result);
        }
        walk(node.getLeft(), order, path, result);
        if (order == TraversalOrder.IN_ORDER) {
            record(node, order, path, result); // between the children
        }
        walk(node.getRight(), order, path, result);
        if (order == TraversalOrder.POST_ORDER) {
            record(node, order, path, result);
        }

        path.pop();
    }

    /**
     * Records one traversal step: the node, the current path (top first) and its explanation.
     *
     * @param node   the node being written down
     * @param order  the traversal order in use
     * @param path   the current path from the root, with {@code node} on top
     * @param result collects the step
     */
    private void record(TreeNode node, TraversalOrder order, Deque<TreeNode> path, DfsResult.Builder result) {
        result.visit(node.getValue(), valuesTopFirst(path), explanations.traversalVisit(node.getValue(), order));
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
