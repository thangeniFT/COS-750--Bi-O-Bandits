package za.ac.up.dfstutor.model;

import java.util.Locale;

/**
 * The three depth-first orders.
 *
 * <p>All three follow exactly the same walk through the tree. They differ only in <em>when</em> a
 * node is written down (see section 2.4 of the SE document):
 * <ul>
 *   <li>{@link #PRE_ORDER}: when the walk first reaches the node, before its children.</li>
 *   <li>{@link #IN_ORDER}: after the left subtree and before the right subtree. For a BST this
 *       lists the values in sorted order.</li>
 *   <li>{@link #POST_ORDER}: after both subtrees, on the way back up.</li>
 * </ul>
 */
public enum TraversalOrder {

    /** Node, then left subtree, then right subtree. Also the order used by DFS search. */
    PRE_ORDER("pre-order"),

    /** Left subtree, then node, then right subtree. Sorted output for a BST. */
    IN_ORDER("in-order"),

    /** Left subtree, then right subtree, then node. */
    POST_ORDER("post-order");

    private final String label;

    TraversalOrder(String label) {
        this.label = label;
    }

    /**
     * Returns the name used in learner-facing text, for example {@code "in-order"}.
     *
     * @return a lower-case, hyphenated label
     */
    public String label() {
        return label;
    }

    /**
     * Converts text from an API request into an order. Accepts the enum name in any case
     * ({@code "IN_ORDER"}, {@code "in_order"}) or the label ({@code "in-order"}).
     *
     * @param text the text to convert
     * @return the matching order
     * @throws IllegalArgumentException if the text is {@code null} or matches no order
     */
    public static TraversalOrder parse(String text) {
        if (text == null) {
            throw new IllegalArgumentException("Traversal order is missing");
        }
        String normalised = text.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        for (TraversalOrder order : values()) {
            if (order.name().equals(normalised)) {
                return order;
            }
        }
        throw new IllegalArgumentException("Unknown traversal order: " + text);
    }
}
