package za.ac.up.dfstutor.model;

/**
 * One node of a binary search tree: a whole-number value plus links to a left and a right child.
 *
 * <p>A node does not know about the BST ordering rule. {@link BinarySearchTree} is responsible
 * for putting each node in the right place. The child setters are package-private so that code
 * outside the {@code model} package (controllers, services) can read the tree but cannot
 * rearrange it by accident.
 */
public final class TreeNode {

    private final int value;
    private TreeNode left;
    private TreeNode right;

    /**
     * Creates a leaf node (a node with no children).
     *
     * @param value the value stored in this node
     */
    public TreeNode(int value) {
        this.value = value;
    }

    /**
     * Returns the value stored in this node. The value never changes after construction.
     *
     * @return this node's value
     */
    public int getValue() {
        return value;
    }

    /**
     * Returns the left child, whose subtree holds only values smaller than this node's value.
     *
     * @return the left child, or {@code null} if there is none
     */
    public TreeNode getLeft() {
        return left;
    }

    /**
     * Returns the right child, whose subtree holds only values larger than this node's value.
     *
     * @return the right child, or {@code null} if there is none
     */
    public TreeNode getRight() {
        return right;
    }

    /**
     * Tells whether this node is a leaf. In the lesson a leaf is the "dead end" where DFS has to
     * backtrack.
     *
     * @return {@code true} if the node has neither a left nor a right child
     */
    public boolean isLeaf() {
        return left == null && right == null;
    }

    /**
     * Attaches a left child. Only {@link BinarySearchTree} should call this.
     *
     * @param left the new left child (may be {@code null})
     */
    void setLeft(TreeNode left) {
        this.left = left;
    }

    /**
     * Attaches a right child. Only {@link BinarySearchTree} should call this.
     *
     * @param right the new right child (may be {@code null})
     */
    void setRight(TreeNode right) {
        this.right = right;
    }

    /**
     * Returns a short description for debugging and log messages, for example {@code TreeNode(50)}.
     *
     * @return a readable description of this node
     */
    @Override
    public String toString() {
        return "TreeNode(" + value + ")";
    }
}
