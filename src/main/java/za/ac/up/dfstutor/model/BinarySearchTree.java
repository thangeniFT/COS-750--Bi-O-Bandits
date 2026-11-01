package za.ac.up.dfstutor.model;

import java.util.List;

/**
 * A binary search tree of whole numbers, built only by insertion.
 *
 * <p><b>The rule</b> (BR-2, BR-3 in the SE document): for every node, all values in its left
 * subtree are smaller and all values in its right subtree are larger. Duplicates are rejected
 * (BR-4), so every value appears at most once.
 *
 * <p><b>Scope.</b> This class only stores the tree. It does not search or traverse it; that is
 * the job of {@link DepthFirstSearch}. It also does not enforce the value range or node limit
 * (BR-1, BR-5); {@link za.ac.up.dfstutor.service.TreeService} does that, because those limits are
 * configuration, not part of what a BST is.
 *
 * <p>This class is not thread-safe. The service layer synchronises access to the shared tree.
 *
 * <p><b>Status:</b> implemented. Use it as the reference for code style in the {@code model}
 * package.
 */
public final class BinarySearchTree {

    private TreeNode root;
    private int size;

    /**
     * Creates an empty tree.
     */
    public BinarySearchTree() {
        // Nothing to do: root is null and size is 0.
    }

    /**
     * Builds a tree by inserting the given values in order. Handy in tests and for building the
     * lesson's example trees.
     *
     * <p>The order matters: inserting {@code 50, 30, 70} gives a balanced tree, while
     * {@code 30, 50, 70} gives a tree that leans right.
     *
     * @param values the values to insert, first to last
     * @return a new tree containing all the values
     * @throws IllegalArgumentException if a value appears more than once
     */
    public static BinarySearchTree of(int... values) {
        BinarySearchTree tree = new BinarySearchTree();
        for (int value : values) {
            if (!tree.insert(value)) {
                throw new IllegalArgumentException("Duplicate value " + value + " in BinarySearchTree.of(...)");
            }
        }
        return tree;
    }

    /**
     * Builds a tree from a list of values, inserted in list order.
     *
     * @param values the values to insert, first to last; must not contain {@code null}
     * @return a new tree containing all the values
     * @throws IllegalArgumentException if a value appears more than once
     * @see #of(int...)
     */
    public static BinarySearchTree of(List<Integer> values) {
        return of(values.stream().mapToInt(Integer::intValue).toArray());
    }

    /**
     * Inserts a value in the position required by the BST rule.
     *
     * <p>Starting at the root, compare the new value with the current node: go left if it is
     * smaller, right if it is larger. When the next position is empty, the new node goes there.
     * A new value always becomes a leaf; existing nodes never move.
     *
     * @param value the value to insert
     * @return {@code true} if the value was inserted; {@code false} if it was already in the tree
     *         (the tree is left unchanged)
     */
    public boolean insert(int value) {
        if (root == null) {
            root = new TreeNode(value);
            size++;
            return true;
        }

        TreeNode current = root;
        while (true) {
            if (value == current.getValue()) {
                return false; // BR-4: duplicates are rejected, the tree is not changed.
            }
            if (value < current.getValue()) {
                if (current.getLeft() == null) {
                    current.setLeft(new TreeNode(value));
                    size++;
                    return true;
                }
                current = current.getLeft();
            } else {
                if (current.getRight() == null) {
                    current.setRight(new TreeNode(value));
                    size++;
                    return true;
                }
                current = current.getRight();
            }
        }
    }

    /**
     * Tells whether a value is in the tree, using the BST rule to follow a single path.
     *
     * <p>Note for the team: this is <em>BST search</em>, not DFS. It exists so the service can
     * check for duplicates and so tests can check insertions. Do not use it to produce anything
     * the student sees as "the DFS result"; that must come from {@link DepthFirstSearch}.
     *
     * @param value the value to look for
     * @return {@code true} if a node holds this value
     */
    public boolean contains(int value) {
        TreeNode current = root;
        while (current != null) {
            if (value == current.getValue()) {
                return true;
            }
            current = value < current.getValue() ? current.getLeft() : current.getRight();
        }
        return false;
    }

    /**
     * Returns the root node, which is where every DFS starts (BR-6).
     *
     * @return the root, or {@code null} if the tree is empty
     */
    public TreeNode getRoot() {
        return root;
    }

    /**
     * Returns the number of nodes in the tree.
     *
     * @return the node count; 0 for an empty tree
     */
    public int size() {
        return size;
    }

    /**
     * Tells whether the tree has no nodes.
     *
     * @return {@code true} if the tree is empty
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the height of the tree, counted in levels: an empty tree has height 0 and a tree with
     * only a root has height 1.
     *
     * <p>The frontend uses this to size the drawing, and the lesson uses it to compare balanced and
     * skewed trees (DFS needs stack space proportional to the height).
     *
     * @return the number of levels in the tree
     */
    public int height() {
        return height(root);
    }

    /**
     * Removes every node, leaving an empty tree.
     */
    public void clear() {
        root = null;
        size = 0;
    }

    /**
     * Recursive helper for {@link #height()}: the height of a subtree is one more than the height
     * of its taller child.
     *
     * @param node the root of the subtree, possibly {@code null}
     * @return the height of that subtree
     */
    private static int height(TreeNode node) {
        if (node == null) {
            return 0;
        }
        return 1 + Math.max(height(node.getLeft()), height(node.getRight()));
    }
}
