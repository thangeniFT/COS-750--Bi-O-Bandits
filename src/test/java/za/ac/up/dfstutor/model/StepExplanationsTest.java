package za.ac.up.dfstutor.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Checks every sentence {@link StepExplanations} can produce against the lesson script
 * (ID document, appendix A). If you change the wording, change the script too.
 */
class StepExplanationsTest {

    private final StepExplanations explanations = new StepExplanations();

    /** Finds a node in a tree by value, so the tests can pass real nodes with real children. */
    private static TreeNode find(BinarySearchTree tree, int value) {
        TreeNode node = tree.getRoot();
        while (node != null && node.getValue() != value) {
            node = value < node.getValue() ? node.getLeft() : node.getRight();
        }
        return node;
    }

    @Nested
    @DisplayName("search steps")
    class Search {

        private final BinarySearchTree treeA = BinarySearchTree.of(50, 30, 70, 20, 40, 60, 80);
        private final BinarySearchTree treeB = BinarySearchTree.of(45, 25, 65, 15, 35, 55, 30);

        @Test
        @DisplayName("two children: both pushes, right first, and which one is on top")
        void twoChildren() {
            assertThat(explanations.searchVisit(find(treeA, 50), 60, List.of(30, 70)))
                .isEqualTo("Visit 50. It is not 60. Push 70 (right), then 30 (left), so 30 is on top.");
        }

        @Test
        @DisplayName("only a left child: that child is pushed")
        void onlyLeftChild() {
            assertThat(explanations.searchVisit(find(treeB, 35), 55, List.of(30, 65)))
                .isEqualTo("Visit 35. It is not 55. It has only a left child, so push 30. 30 is on top.");
        }

        @Test
        @DisplayName("only a right child: that child is pushed")
        void onlyRightChild() {
            BinarySearchTree skewed = BinarySearchTree.of(10, 20);

            assertThat(explanations.searchVisit(find(skewed, 10), 99, List.of(20)))
                .isEqualTo("Visit 10. It is not 99. It has only a right child, so push 20. 20 is on top.");
        }

        @Test
        @DisplayName("leaf: nothing to push, backtrack to the new top")
        void leafBacktracks() {
            assertThat(explanations.searchVisit(find(treeA, 20), 60, List.of(40, 70)))
                .isEqualTo("Visit 20. It is not 60. It is a leaf, so there is nothing to push. "
                    + "Backtrack: 40 is now on top.");
        }

        @Test
        @DisplayName("leaf with an empty stack: the target is not in the tree")
        void leafWithEmptyStack() {
            assertThat(explanations.searchVisit(find(treeA, 80), 65, List.of()))
                .isEqualTo("Visit 80. It is not 65. It is a leaf, so there is nothing to push. "
                    + "There is nothing left on the stack, so 65 is not in the tree.");
        }

        @Test
        @DisplayName("found: say so and stop")
        void found() {
            assertThat(explanations.searchFound(60)).isEqualTo("Visit 60. This is the target. Stop searching.");
        }
    }

    @Nested
    @DisplayName("traversal steps")
    class Traversal {

        @Test
        @DisplayName("pre-order: write the node down on arrival")
        void preOrder() {
            assertThat(explanations.traversalVisit(50, TraversalOrder.PRE_ORDER))
                .isEqualTo("Arrive at 50 and write it down straight away: "
                    + "in pre-order a node comes before its children.");
        }

        @Test
        @DisplayName("in-order: write the node down between its subtrees")
        void inOrder() {
            assertThat(explanations.traversalVisit(50, TraversalOrder.IN_ORDER))
                .isEqualTo("You have finished everything left of 50, so write 50 down now: left, node, right.");
        }

        @Test
        @DisplayName("post-order: write the node down on the way back up")
        void postOrder() {
            assertThat(explanations.traversalVisit(50, TraversalOrder.POST_ORDER))
                .isEqualTo("You have finished both sides of 50, so write it down on the way back up.");
        }
    }

    @Test
    @DisplayName("a real search tells the whole story, step by step (tree A, target 60)")
    void fullSearchStory() {
        DfsResult result = new DepthFirstSearch(explanations)
            .search(BinarySearchTree.of(50, 30, 70, 20, 40, 60, 80), 60);

        assertThat(result.steps()).extracting(DfsStep::explanation).containsExactly(
            "Visit 50. It is not 60. Push 70 (right), then 30 (left), so 30 is on top.",
            "Visit 30. It is not 60. Push 40 (right), then 20 (left), so 20 is on top.",
            "Visit 20. It is not 60. It is a leaf, so there is nothing to push. Backtrack: 40 is now on top.",
            "Visit 40. It is not 60. It is a leaf, so there is nothing to push. Backtrack: 70 is now on top.",
            "Visit 70. It is not 60. Push 80 (right), then 60 (left), so 60 is on top.",
            "Visit 60. This is the target. Stop searching.");
    }
}
