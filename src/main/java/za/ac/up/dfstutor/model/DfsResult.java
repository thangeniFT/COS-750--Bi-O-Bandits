package za.ac.up.dfstutor.model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The complete outcome of a depth-first search or traversal, sent to the browser as JSON.
 *
 * <p>Example (search for 60 on the example tree, abbreviated):
 * <pre>{@code
 * { "order": "PRE_ORDER", "target": 60, "found": true,
 *   "visitOrder": [50, 30, 20, 40, 70, 60], "nodesVisited": 6,
 *   "steps": [ { "number": 1, "node": 50, "stackAfter": [30, 70], "explanation": "..." }, ... ] }
 * }</pre>
 *
 * <p>Create instances with {@link #builder(TraversalOrder, Integer)} rather than the constructor;
 * the builder keeps {@code visitOrder} and {@code steps} consistent.
 *
 * @param order      the depth-first order used ({@link TraversalOrder#PRE_ORDER} for every search)
 * @param target     the value searched for, or {@code null} for a traversal
 * @param found      {@code true} if a search found its target; always {@code false} for a traversal
 * @param visitOrder the values in the order they were visited (one entry per step)
 * @param steps      the step-by-step history used by the step player
 */
public record DfsResult(
        TraversalOrder order,
        Integer target,
        boolean found,
        List<Integer> visitOrder,
        List<DfsStep> steps) {

    /**
     * Validates the result and stores unmodifiable copies of the lists.
     *
     * @throws NullPointerException     if {@code order}, {@code visitOrder} or {@code steps} is {@code null}
     * @throws IllegalArgumentException if the visit order and steps disagree, or a traversal claims
     *                                  to have found something
     */
    public DfsResult {
        Objects.requireNonNull(order, "order");
        visitOrder = List.copyOf(visitOrder);
        steps = List.copyOf(steps);
        if (visitOrder.size() != steps.size()) {
            throw new IllegalArgumentException("visitOrder and steps must have the same length");
        }
        if (target == null && found) {
            throw new IllegalArgumentException("A traversal (no target) cannot be 'found'");
        }
    }

    /**
     * Returns how many real nodes were visited. Empty (null) children are never counted (BR-10).
     *
     * <p>Serialised to JSON as {@code "nodesVisited"}.
     *
     * @return the number of visited nodes
     */
    @JsonProperty("nodesVisited")
    public int nodesVisited() {
        return visitOrder.size();
    }

    /**
     * Starts building a result.
     *
     * @param order  the order being used
     * @param target the value searched for, or {@code null} for a traversal
     * @return a new, empty builder
     */
    public static Builder builder(TraversalOrder order, Integer target) {
        return new Builder(order, target);
    }

    /**
     * Collects steps while an algorithm runs, then produces the finished {@link DfsResult}.
     *
     * <p>Typical use inside {@link DepthFirstSearch}:
     * <pre>{@code
     * DfsResult.Builder result = DfsResult.builder(TraversalOrder.PRE_ORDER, target);
     * result.visit(node.getValue(), DepthFirstSearch.valuesTopFirst(stack), explanation);
     * ...
     * return result.found();   // or result.notFound() / result.completed()
     * }</pre>
     */
    public static final class Builder {

        private final TraversalOrder order;
        private final Integer target;
        private final List<Integer> visitOrder = new ArrayList<>();
        private final List<DfsStep> steps = new ArrayList<>();

        private Builder(TraversalOrder order, Integer target) {
            this.order = Objects.requireNonNull(order, "order");
            this.target = target;
        }

        /**
         * Records that a node has just been visited.
         *
         * @param node              the value of the visited node
         * @param stackAfterTopFirst the stack straight after this step, top first
         * @param explanation       the learner-facing sentence for this step
         * @return this builder, for chaining
         */
        public Builder visit(int node, Collection<Integer> stackAfterTopFirst, String explanation) {
            visitOrder.add(node);
            steps.add(new DfsStep(steps.size() + 1, node, List.copyOf(stackAfterTopFirst), explanation));
            return this;
        }

        /**
         * Returns how many steps have been recorded so far.
         *
         * @return the current step count
         */
        public int stepCount() {
            return steps.size();
        }

        /**
         * Finishes a search that found its target.
         *
         * @return the finished result with {@code found = true}
         * @throws IllegalStateException if this builder was created for a traversal (no target)
         */
        public DfsResult found() {
            if (target == null) {
                throw new IllegalStateException("found() is only for searches; use completed() for traversals");
            }
            return new DfsResult(order, target, true, visitOrder, steps);
        }

        /**
         * Finishes a search that did not find its target (the stack ran empty).
         *
         * @return the finished result with {@code found = false}
         * @throws IllegalStateException if this builder was created for a traversal (no target)
         */
        public DfsResult notFound() {
            if (target == null) {
                throw new IllegalStateException("notFound() is only for searches; use completed() for traversals");
            }
            return new DfsResult(order, target, false, visitOrder, steps);
        }

        /**
         * Finishes a traversal, which visits every node and has no target.
         *
         * @return the finished result with {@code target = null} and {@code found = false}
         * @throws IllegalStateException if this builder was created for a search
         */
        public DfsResult completed() {
            if (target != null) {
                throw new IllegalStateException("completed() is only for traversals; use found()/notFound() for searches");
            }
            return new DfsResult(order, null, false, visitOrder, steps);
        }
    }
}
