package za.ac.up.dfstutor.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import za.ac.up.dfstutor.config.TutorProperties;
import za.ac.up.dfstutor.dto.ErrorCode;
import za.ac.up.dfstutor.dto.TreeView;
import za.ac.up.dfstutor.model.BinarySearchTree;
import za.ac.up.dfstutor.model.DepthFirstSearch;
import za.ac.up.dfstutor.model.DfsResult;
import za.ac.up.dfstutor.model.TraversalOrder;

/**
 * Application logic between the HTTP layer and the domain model.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Owns the <b>sandbox tree</b>: the one tree that insert and reset change. It starts as the
 *       example tree from {@link TutorProperties#exampleTree()}.</li>
 *   <li>Enforces the limits that are configuration rather than part of a BST: the value range
 *       (BR-1) and the node limit (BR-5). Duplicates (BR-4) are reported here with a friendly
 *       message.</li>
 *   <li>Builds temporary trees from a list of values for the lesson screens, so that lesson
 *       content never depends on what a student did in the sandbox.</li>
 *   <li>Delegates the algorithm to {@link DepthFirstSearch}.</li>
 * </ul>
 *
 * <p><b>Note on sharing:</b> there are no user accounts (by design), so there is exactly one sandbox
 * tree per running server. That is fine when each student runs the app on their own laptop, which
 * is the prototype's deployment model. If the app is ever hosted for a whole class, students would
 * see each other's inserts; backlog ticket B-04 (a tree per browser session) addresses that.
 *
 * <p>Methods that touch the sandbox are {@code synchronized} because Spring may handle two
 * requests at the same time and {@link BinarySearchTree} is not thread-safe.
 *
 * <p><b>Status:</b> implemented. DFS calls will throw until tickets B-01 and B-02 are done.
 */
@Service
public class TreeService {

    private final TutorProperties properties;
    private final DepthFirstSearch dfs;
    private final BinarySearchTree sandbox = new BinarySearchTree();

    /**
     * Creates the service and fills the sandbox with the example tree.
     *
     * @param properties value range, node limit and example tree
     * @param dfs        the DFS algorithm
     */
    public TreeService(TutorProperties properties, DepthFirstSearch dfs) {
        this.properties = properties;
        this.dfs = dfs;
        reset();
    }

    /**
     * Returns the current sandbox tree for drawing.
     *
     * @return a read-only copy of the sandbox tree's shape
     */
    public synchronized TreeView getTree() {
        return TreeView.from(sandbox);
    }

    /**
     * Inserts a value into the sandbox tree.
     *
     * @param value the value to insert
     * @return the updated tree
     * @throws TutorException {@code INVALID_NUMBER} if the value is out of range,
     *                        {@code DUPLICATE_VALUE} if it is already in the tree, or
     *                        {@code TREE_FULL} if the tree already has the maximum number of nodes
     */
    public synchronized TreeView insert(int value) {
        checkRange(value);
        if (sandbox.contains(value)) {
            throw duplicate(value);
        }
        if (sandbox.size() >= properties.maxNodes()) {
            throw new TutorException(ErrorCode.TREE_FULL,
                    "The tree already has " + properties.maxNodes()
                            + " nodes, which is the most this app can draw clearly. Reset the tree to start again.");
        }
        sandbox.insert(value);
        return TreeView.from(sandbox);
    }

    /**
     * Restores the sandbox to the example tree.
     *
     * @return the example tree
     */
    public synchronized TreeView reset() {
        sandbox.clear();
        for (int value : properties.exampleTree()) {
            sandbox.insert(value);
        }
        return TreeView.from(sandbox);
    }

    /**
     * Builds a tree from a list of values and returns its shape, without storing it.
     *
     * @param values the insertion order
     * @return the shape of the resulting tree
     * @throws TutorException if the values break a rule (see {@link #buildTree(List)})
     */
    public TreeView preview(List<Integer> values) {
        return TreeView.from(buildTree(values));
    }

    /**
     * Runs a DFS search.
     *
     * @param target the value to search for
     * @param values {@code null} to search the sandbox tree, or an insertion order to search a
     *               temporary tree built from it
     * @return the search result with every step
     * @throws TutorException                if the target or values break a rule
     * @throws UnsupportedOperationException until backlog ticket B-01 is done
     */
    public synchronized DfsResult search(int target, List<Integer> values) {
        checkRange(target);
        BinarySearchTree tree = values == null ? sandbox : buildTree(values);
        return dfs.search(tree, target);
    }

    /**
     * Runs a DFS traversal.
     *
     * @param order  the order as text, for example {@code "IN_ORDER"}
     * @param values {@code null} for the sandbox tree, or an insertion order for a temporary tree
     * @return the traversal result with every step
     * @throws TutorException                {@code INVALID_ORDER} for an unknown order, or if the
     *                                       values break a rule
     * @throws UnsupportedOperationException until backlog ticket B-02 is done
     */
    public synchronized DfsResult traverse(String order, List<Integer> values) {
        TraversalOrder parsed;
        try {
            parsed = TraversalOrder.parse(order);
        } catch (IllegalArgumentException e) {
            throw new TutorException(ErrorCode.INVALID_ORDER,
                    "\"" + order + "\" is not a traversal order. Choose pre-order, in-order or post-order.");
        }
        BinarySearchTree tree = values == null ? sandbox : buildTree(values);
        return dfs.traverse(tree, parsed);
    }

    /**
     * Builds a temporary tree, applying the same rules as {@link #insert(int)}.
     *
     * @param values the insertion order
     * @return a new tree, independent of the sandbox
     * @throws TutorException {@code TREE_FULL} if there are too many values, {@code INVALID_NUMBER}
     *                        for an empty entry or a value out of range, or {@code DUPLICATE_VALUE}
     */
    private BinarySearchTree buildTree(List<Integer> values) {
        if (values.size() > properties.maxNodes()) {
            throw new TutorException(ErrorCode.TREE_FULL,
                    "A tree can have at most " + properties.maxNodes() + " nodes.");
        }
        Set<Integer> seen = new HashSet<>();
        BinarySearchTree tree = new BinarySearchTree();
        for (Integer value : values) {
            if (value == null) {
                throw new TutorException(ErrorCode.INVALID_NUMBER, "The list of values has an empty entry.");
            }
            checkRange(value);
            if (!seen.add(value)) {
                throw duplicate(value);
            }
            tree.insert(value);
        }
        return tree;
    }

    /**
     * Checks BR-1: values must be whole numbers in the configured range.
     *
     * @param value the value to check
     * @throws TutorException {@code INVALID_NUMBER} if the value is out of range
     */
    private void checkRange(int value) {
        if (value < properties.minValue() || value > properties.maxValue()) {
            throw new TutorException(ErrorCode.INVALID_NUMBER,
                    value + " is outside the range this app uses. Use a whole number from "
                            + properties.minValue() + " to " + properties.maxValue() + ".");
        }
    }

    /**
     * Builds the friendly message for BR-4.
     *
     * @param value the duplicate value
     * @return the exception to throw
     */
    private static TutorException duplicate(int value) {
        return new TutorException(ErrorCode.DUPLICATE_VALUE,
                value + " is already in the tree. Each value can appear only once in this BST.");
    }
}
