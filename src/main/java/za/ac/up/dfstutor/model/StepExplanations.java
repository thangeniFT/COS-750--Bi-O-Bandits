package za.ac.up.dfstutor.model;

import java.util.List;

/**
 * Writes the learner-facing sentence shown under the tree for each DFS step.
 *
 * <p>Wording lives in its own class so that the people writing lesson content can own it without
 * touching the algorithm. Follow the writing rules in the ID document (section 7.2): short
 * sentences, second person, and always say <em>why</em>, not only <em>what</em>.
 *
 * <p><b>Status:</b> placeholder wording.
 */
public class StepExplanations {

    /**
     * Explains a search step where the visited node is <em>not</em> the target.
     *
     * @param visited            the node just taken off the stack
     * @param target             the value being searched for
     * @param stackAfterTopFirst the stack after the children were pushed, top first
     * @return one or two sentences describing the step
     */
    public String searchVisit(TreeNode visited, int target, List<Integer> stackAfterTopFirst) {
        String start = "Visit " + visited.getValue() + ". It is not " + target + ". ";
        TreeNode left = visited.getLeft();
        TreeNode right = visited.getRight();

// Two children: say both pushes in the order they happen, and why left ends on top.
        if (left != null && right != null) {
            return start + "Push " + right.getValue() + " (right), then " + left.getValue()
                + " (left), so " + left.getValue() + " is on top.";
        }

// One child: only that child is pushed.
        if (left != null || right != null) {
            TreeNode child = left != null ? left : right;
            String side = left != null ? "left" : "right";
            return start + "It has only a " + side + " child, so push " + child.getValue() + ". "
                + child.getValue() + " is on top.";
        }

// Leaf: nothing to push. Either backtrack to whatever is now on top, or the search is over.
        String leaf = start + "It is a leaf, so there is nothing to push. ";
        if (stackAfterTopFirst.isEmpty()) {
            return leaf + "There is nothing left on the stack, so " + target + " is not in the tree.";
        }
        return leaf + "Backtrack: " + stackAfterTopFirst.getFirst() + " is now on top.";

    }

    /**
     * Explains the search step that finds the target.
     *
     * @param node the value of the node that matched the target
     * @return the sentence for the final step of a successful search
     */
    public String searchFound(int node) {
        return "Visit " + node + ". This is the target. Stop searching.";
    }

    /**
     * Explains a traversal step, which records (writes down) one node.
     * @param node  the value being recorded
     * @param order the traversal order in use
     * @return one or two sentences describing the step
     */
    public String traversalVisit(int node, TraversalOrder order) {
        // A switch expression must cover every order, so adding a new order will not compile
        return switch (order) {
            case PRE_ORDER -> "Arrive at " + node + " and write it down straight away: "
                + "in pre-order a node comes before its children.";
            case IN_ORDER -> "You have finished everything left of " + node + ", so write " + node
                + " down now: left, node, right.";
            case POST_ORDER -> "You have finished both sides of " + node
                + ", so write it down on the way back up.";
        };
    }
}
