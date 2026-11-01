package za.ac.up.dfstutor.model;

import java.util.List;
import java.util.Objects;

/**
 * One step of a depth-first walk, as the step player shows it: which node was visited, what the
 * stack looked like straight afterwards, and a sentence explaining what happened.
 *
 * <p>The frontend never works out DFS itself (NFR-03). Everything it needs to animate a step is
 * in this record.
 *
 * @param number      the step number, starting at 1
 * @param node        the value of the node visited in this step
 * @param stackAfter  the stack after this step, <b>top first</b>. For a search this is the explicit
 *                    stack of nodes still to visit; for a traversal it is the recursion (call) stack,
 *                    which is the path from the root down to the current node
 * @param explanation one or two learner-facing sentences, produced by {@link StepExplanations}
 */
public record DfsStep(int number, int node, List<Integer> stackAfter, String explanation) {

    /**
     * Validates the step and takes an unmodifiable copy of the stack so that later changes to the
     * algorithm's working stack cannot change a step that has already been recorded.
     *
     * @throws IllegalArgumentException if {@code number} is less than 1
     * @throws NullPointerException     if {@code stackAfter} or {@code explanation} is {@code null}
     */
    public DfsStep {
        if (number < 1) {
            throw new IllegalArgumentException("Step numbers start at 1");
        }
        stackAfter = List.copyOf(stackAfter);
        Objects.requireNonNull(explanation, "explanation");
    }
}
