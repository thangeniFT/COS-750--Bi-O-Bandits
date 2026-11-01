package za.ac.up.dfstutor.model;

import java.util.List;

/**
 * Writes the learner-facing sentence shown under the tree for each DFS step.
 *
 * <p>Wording lives in its own class so that the people writing lesson content can own it without
 * touching the algorithm. Follow the writing rules in the ID document (section 7.2): short
 * sentences, second person, and always say <em>why</em>, not only <em>what</em>.
 *
 * <p><b>Status:</b> placeholder wording. Backlog ticket <b>B-03</b> replaces each method body with
 * the full wording shown in the examples below (taken from the lesson script, ID document
 * appendix A). The placeholders are deliberately simple but correct, so tickets B-01 and B-02 do
 * not have to wait for B-03.
 */
public class StepExplanations {

    /**
     * Explains a search step where the visited node is <em>not</em> the target.
     *
     * <p>Target wording for B-03, by case:
     * <ul>
     *   <li>two children: "Visit 50. It is not 60. Push 70 (right), then 30 (left), so 30 is on top."</li>
     *   <li>one child: "Visit 35. It is not 55. It has only a left child, so push 30. 30 is on top."</li>
     *   <li>leaf: "Visit 20. It is not 60. It is a leaf, so there is nothing to push. Backtrack:
     *       40 is now on top."</li>
     *   <li>leaf, stack now empty: "... There is nothing left on the stack, so 65 is not in the tree."</li>
     * </ul>
     *
     * @param visited            the node just taken off the stack
     * @param target             the value being searched for
     * @param stackAfterTopFirst the stack after the children were pushed, top first
     * @return one or two sentences describing the step
     */
    public String searchVisit(TreeNode visited, int target, List<Integer> stackAfterTopFirst) {
        // TODO(B-03): replace with the full wording described above.
        return "Visit " + visited.getValue() + ". It is not " + target + ".";
    }

    /**
     * Explains the search step that finds the target.
     *
     * <p>Target wording for B-03: "Visit 60. This is the target. Stop searching."
     *
     * @param node the value of the node that matched the target
     * @return the sentence for the final step of a successful search
     */
    public String searchFound(int node) {
        // TODO(B-03): replace with the full wording described above.
        return "Visit " + node + ". Found it.";
    }

    /**
     * Explains a traversal step, which records (writes down) one node.
     *
     * <p>Target wording for B-03, by order:
     * <ul>
     *   <li>pre-order: "Arrive at 50 and write it down straight away: in pre-order a node comes
     *       before its children."</li>
     *   <li>in-order: "You have finished everything left of 50, so write 50 down now: left, node,
     *       right."</li>
     *   <li>post-order: "You have finished both sides of 50, so write it down on the way back up."</li>
     * </ul>
     *
     * @param node  the value being recorded
     * @param order the traversal order in use
     * @return one or two sentences describing the step
     */
    public String traversalVisit(int node, TraversalOrder order) {
        // TODO(B-03): replace with the full wording described above.
        return "Write down " + node + " (" + order.label() + ").";
    }
}
