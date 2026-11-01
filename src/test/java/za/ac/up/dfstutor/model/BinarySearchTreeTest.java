package za.ac.up.dfstutor.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Tests for {@link BinarySearchTree}: insertion follows the BST rule and duplicates are rejected.
 */
class BinarySearchTreeTest {

    /** The example tree from the lesson (tree A). */
    private static BinarySearchTree treeA() {
        return BinarySearchTree.of(50, 30, 70, 20, 40, 60, 80);
    }

    @Test
    @DisplayName("a new tree is empty")
    void newTreeIsEmpty() {
        BinarySearchTree tree = new BinarySearchTree();

        assertThat(tree.isEmpty()).isTrue();
        assertThat(tree.size()).isZero();
        assertThat(tree.height()).isZero();
        assertThat(tree.getRoot()).isNull();
    }

    @Test
    @DisplayName("the first value becomes the root")
    void firstValueBecomesRoot() {
        BinarySearchTree tree = BinarySearchTree.of(50);

        assertThat(tree.getRoot().getValue()).isEqualTo(50);
        assertThat(tree.getRoot().isLeaf()).isTrue();
        assertThat(tree.height()).isEqualTo(1);
    }

    @Test
    @DisplayName("smaller values go left and larger values go right")
    void insertFollowsBstRule() {
        TreeNode root = treeA().getRoot();

        assertThat(root.getValue()).isEqualTo(50);
        assertThat(root.getLeft().getValue()).isEqualTo(30);
        assertThat(root.getRight().getValue()).isEqualTo(70);
        assertThat(root.getLeft().getLeft().getValue()).isEqualTo(20);
        assertThat(root.getLeft().getRight().getValue()).isEqualTo(40);
        assertThat(root.getRight().getLeft().getValue()).isEqualTo(60);
        assertThat(root.getRight().getRight().getValue()).isEqualTo(80);
    }

    @Test
    @DisplayName("65 is inserted as the right child of 60 (quiz item 1B)")
    void insert65BecomesRightChildOf60() {
        BinarySearchTree tree = treeA();

        assertThat(tree.insert(65)).isTrue();

        TreeNode sixty = tree.getRoot().getRight().getLeft();
        assertThat(sixty.getValue()).isEqualTo(60);
        assertThat(sixty.getRight().getValue()).isEqualTo(65);
        assertThat(tree.size()).isEqualTo(8);
        assertThat(tree.height()).isEqualTo(4);
    }

    @Test
    @DisplayName("a duplicate is rejected and the tree is unchanged (BR-4)")
    void duplicateIsRejected() {
        BinarySearchTree tree = treeA();

        assertThat(tree.insert(40)).isFalse();
        assertThat(tree.size()).isEqualTo(7);
    }

    @Test
    @DisplayName("of(...) refuses duplicate values")
    void ofRejectsDuplicates() {
        assertThatThrownBy(() -> BinarySearchTree.of(10, 20, 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10");
    }

    @Test
    @DisplayName("contains finds every inserted value and nothing else")
    void containsFindsInsertedValues() {
        BinarySearchTree tree = treeA();

        for (int value : new int[] {50, 30, 70, 20, 40, 60, 80}) {
            assertThat(tree.contains(value)).as("contains(%d)", value).isTrue();
        }
        assertThat(tree.contains(65)).isFalse();
        assertThat(tree.contains(0)).isFalse();
    }

    @Test
    @DisplayName("values inserted in sorted order make a skewed tree")
    void sortedInsertionMakesSkewedTree() {
        BinarySearchTree tree = BinarySearchTree.of(10, 20, 30, 40);

        assertThat(tree.height()).isEqualTo(4);
        assertThat(tree.getRoot().getLeft()).isNull();
    }

    @Test
    @DisplayName("tree B from the practice screen has the expected shape")
    void treeBShape() {
        BinarySearchTree tree = BinarySearchTree.of(45, 25, 65, 15, 35, 55, 30);
        TreeNode root = tree.getRoot();

        assertThat(root.getLeft().getRight().getValue()).isEqualTo(35);
        assertThat(root.getLeft().getRight().getLeft().getValue()).isEqualTo(30);
        assertThat(root.getLeft().getRight().getRight()).isNull();
        assertThat(root.getRight().getLeft().getValue()).isEqualTo(55);
        assertThat(root.getRight().getRight()).isNull();
        assertThat(tree.height()).isEqualTo(4);
    }

    @Test
    @DisplayName("clear removes everything")
    void clearEmptiesTree() {
        BinarySearchTree tree = treeA();

        tree.clear();

        assertThat(tree.isEmpty()).isTrue();
        assertThat(tree.getRoot()).isNull();
        assertThat(tree.insert(50)).isTrue();
    }
}
