package za.ac.up.dfstutor.dto;

import za.ac.up.dfstutor.model.BinarySearchTree;
import za.ac.up.dfstutor.model.TreeNode;

/**
 * A read-only copy of a tree's shape, sent to the browser so it can draw the tree.
 *
 * <p>Example (a three-node tree):
 * <pre>{@code
 * { "root": { "value": 50,
 *             "left":  { "value": 30, "left": null, "right": null },
 *             "right": { "value": 70, "left": null, "right": null } },
 *   "size": 3, "height": 2 }
 * }</pre>
 *
 * <p>The browser only draws this; it never inserts into it or searches it.
 *
 * @param root   the root node, or {@code null} for an empty tree
 * @param size   number of nodes
 * @param height number of levels (0 for an empty tree)
 */
public record TreeView(NodeView root, int size, int height) {

    /**
     * Copies a tree into a {@code TreeView}.
     *
     * @param tree the tree to copy (not modified)
     * @return a view with the same shape and values
     */
    public static TreeView from(BinarySearchTree tree) {
        return new TreeView(NodeView.from(tree.getRoot()), tree.size(), tree.height());
    }

    /**
     * One node in a {@link TreeView}.
     *
     * @param value the node's value
     * @param left  the left child, or {@code null}
     * @param right the right child, or {@code null}
     */
    public record NodeView(int value, NodeView left, NodeView right) {

        /**
         * Recursively copies a node and everything below it.
         *
         * @param node the node to copy, possibly {@code null}
         * @return the copy, or {@code null} if {@code node} is {@code null}
         */
        static NodeView from(TreeNode node) {
            if (node == null) {
                return null;
            }
            return new NodeView(node.getValue(), from(node.getLeft()), from(node.getRight()));
        }
    }
}
