package za.ac.up.dfstutor.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * The specification for {@link DepthFirstSearch}, written before the code.
 *
 * <p><b>How to use this file:</b> each nested class belongs to one backlog ticket and is
 * {@code @Disabled} until that ticket is picked up. When you start the ticket, delete the
 * {@code @Disabled} line for your class, run the tests (they fail), then implement until they pass.
 * Every expected value here comes from the worked examples in the SE and ID documents, so if a test
 * and a document disagree, raise it in the ticket rather than changing the test quietly.
 */
class DepthFirstSearchTest {

    private final DepthFirstSearch dfs = new DepthFirstSearch(new StepExplanations());

    /** Tree A: the example tree used in the worked example. */
    private static BinarySearchTree treeA() {
        return BinarySearchTree.of(50, 30, 70, 20, 40, 60, 80);
    }

    /** Tree B: the uneven tree used in guided practice. */
    private static BinarySearchTree treeB() {
        return BinarySearchTree.of(45, 25, 65, 15, 35, 55, 30);
    }

    /** Collects the {@code stackAfter} list of every step, in step order. */
    private static List<List<Integer>> stacks(DfsResult result) {
        return result.steps().stream().map(DfsStep::stackAfter).toList();
    }

    @Nested
    @DisplayName("search (backlog ticket B-01)")
    class Search {

        @Test
        @DisplayName("an empty tree: not found, nothing visited")
        void emptyTree() {
            DfsResult result = dfs.search(new BinarySearchTree(), 60);

            assertThat(result.found()).isFalse();
            assertThat(result.nodesVisited()).isZero();
            assertThat(result.steps()).isEmpty();
        }

        @Test
        @DisplayName("the root is found in one visit")
        void rootFoundInOneVisit() {
            DfsResult result = dfs.search(treeA(), 50);

            assertThat(result.found()).isTrue();
            assertThat(result.visitOrder()).containsExactly(50);
        }

        @Test
        @DisplayName("60: the whole left subtree is explored first (SE table 1)")
        void searchFor60() {
            DfsResult result = dfs.search(treeA(), 60);

            assertThat(result.order()).isEqualTo(TraversalOrder.PRE_ORDER);
            assertThat(result.target()).isEqualTo(60);
            assertThat(result.found()).isTrue();
            assertThat(result.visitOrder()).containsExactly(50, 30, 20, 40, 70, 60);
            assertThat(result.nodesVisited()).isEqualTo(6);
        }

        @Test
        @DisplayName("60: the stack after each step matches the worked example")
        void searchFor60Stacks() {
            DfsResult result = dfs.search(treeA(), 60);

            assertThat(stacks(result)).containsExactly(
                    List.of(30, 70),
                    List.of(20, 40, 70),
                    List.of(40, 70),
                    List.of(70),
                    List.of(60, 80),
                    List.of(80));
        }

        @Test
        @DisplayName("65 (missing): every node is visited and the stack ends empty")
        void missingValueVisitsEveryNode() {
            DfsResult result = dfs.search(treeA(), 65);

            assertThat(result.found()).isFalse();
            assertThat(result.visitOrder()).containsExactly(50, 30, 20, 40, 70, 60, 80);
            assertThat(result.steps().getLast().stackAfter()).isEmpty();
        }

        @Test
        @DisplayName("80: DFS ignores the ordering and visits all 7 nodes (quiz item 5A, BR-11)")
        void searchFor80VisitsEverything() {
            DfsResult result = dfs.search(treeA(), 80);

            assertThat(result.found()).isTrue();
            assertThat(result.nodesVisited()).isEqualTo(7);
        }

        @Test
        @DisplayName("tree B, 55: nodes with one child push only that child (ID practice trace)")
        void treeBSearchFor55() {
            DfsResult result = dfs.search(treeB(), 55);

            assertThat(result.visitOrder()).containsExactly(45, 25, 15, 35, 30, 65, 55);
            assertThat(stacks(result)).containsExactly(
                    List.of(25, 65),
                    List.of(15, 35, 65),
                    List.of(35, 65),
                    List.of(30, 65),
                    List.of(65),
                    List.of(55),
                    List.of());
        }

        @Test
        @DisplayName("tree B, 30: found after 5 visits (quiz item 5B)")
        void treeBSearchFor30() {
            assertThat(dfs.search(treeB(), 30).visitOrder()).containsExactly(45, 25, 15, 35, 30);
        }

        @Test
        @DisplayName("steps are numbered 1, 2, 3, ... and each has an explanation")
        void stepsAreNumberedAndExplained() {
            DfsResult result = dfs.search(treeA(), 65);

            for (int i = 0; i < result.steps().size(); i++) {
                DfsStep step = result.steps().get(i);
                assertThat(step.number()).isEqualTo(i + 1);
                assertThat(step.node()).isEqualTo(result.visitOrder().get(i));
                assertThat(step.explanation()).isNotBlank();
            }
        }

        @Test
        @DisplayName("the tree is not changed by a search")
        void searchDoesNotModifyTree() {
            BinarySearchTree tree = treeA();

            dfs.search(tree, 65);

            assertThat(tree.size()).isEqualTo(7);
            assertThat(tree.getRoot().getValue()).isEqualTo(50);
        }
    }

    @Nested
    @DisplayName("traverse (backlog ticket B-02)")
    @Disabled("Enable when backlog ticket B-02 (DFS traversal) is picked up")
    class Traversal {

        @Test
        @DisplayName("pre-order of tree A")
        void preOrder() {
            DfsResult result = dfs.traverse(treeA(), TraversalOrder.PRE_ORDER);

            assertThat(result.visitOrder()).containsExactly(50, 30, 20, 40, 70, 60, 80);
            assertThat(result.target()).isNull();
            assertThat(result.found()).isFalse();
        }

        @Test
        @DisplayName("in-order of tree A is sorted")
        void inOrder() {
            assertThat(dfs.traverse(treeA(), TraversalOrder.IN_ORDER).visitOrder())
                    .containsExactly(20, 30, 40, 50, 60, 70, 80);
        }

        @Test
        @DisplayName("post-order of tree A")
        void postOrder() {
            assertThat(dfs.traverse(treeA(), TraversalOrder.POST_ORDER).visitOrder())
                    .containsExactly(20, 40, 30, 60, 80, 70, 50);
        }

        @Test
        @DisplayName("tree B in all three orders (ID document, example trees table)")
        void treeBOrders() {
            assertThat(dfs.traverse(treeB(), TraversalOrder.PRE_ORDER).visitOrder())
                    .containsExactly(45, 25, 15, 35, 30, 65, 55);
            assertThat(dfs.traverse(treeB(), TraversalOrder.IN_ORDER).visitOrder())
                    .containsExactly(15, 25, 30, 35, 45, 55, 65);
            assertThat(dfs.traverse(treeB(), TraversalOrder.POST_ORDER).visitOrder())
                    .containsExactly(15, 30, 35, 25, 55, 65, 45);
        }

        @Test
        @DisplayName("each step's stack is the path from the root, top first")
        void stackIsPathFromRoot() {
            DfsResult inOrder = dfs.traverse(treeA(), TraversalOrder.IN_ORDER);
            DfsResult preOrder = dfs.traverse(treeA(), TraversalOrder.PRE_ORDER);

            assertThat(inOrder.steps().getFirst().stackAfter()).containsExactly(20, 30, 50);
            assertThat(preOrder.steps().getFirst().stackAfter()).containsExactly(50);
            assertThat(preOrder.steps().get(3).stackAfter()).containsExactly(40, 30, 50);
        }

        @Test
        @DisplayName("a skewed tree is traversed correctly")
        void skewedTree() {
            BinarySearchTree skewed = BinarySearchTree.of(10, 20, 30, 40);

            assertThat(dfs.traverse(skewed, TraversalOrder.PRE_ORDER).visitOrder()).containsExactly(10, 20, 30, 40);
            assertThat(dfs.traverse(skewed, TraversalOrder.IN_ORDER).visitOrder()).containsExactly(10, 20, 30, 40);
            assertThat(dfs.traverse(skewed, TraversalOrder.POST_ORDER).visitOrder()).containsExactly(40, 30, 20, 10);
        }

        @Test
        @DisplayName("an empty tree has no steps")
        void emptyTree() {
            assertThat(dfs.traverse(new BinarySearchTree(), TraversalOrder.IN_ORDER).steps()).isEmpty();
        }

        @Test
        @DisplayName("in-order is sorted for 200 random BSTs, and every order visits each node once")
        void randomTrees() {
            Random random = new Random(212); // fixed seed: failures are reproducible
            for (int run = 0; run < 200; run++) {
                Set<Integer> values = new LinkedHashSet<>();
                int count = 1 + random.nextInt(15);
                while (values.size() < count) {
                    values.add(random.nextInt(100));
                }
                BinarySearchTree tree = BinarySearchTree.of(new ArrayList<>(values));

                List<Integer> sorted = values.stream().sorted().toList();
                assertThat(dfs.traverse(tree, TraversalOrder.IN_ORDER).visitOrder())
                        .as("in-order of %s", values).isEqualTo(sorted);
                for (TraversalOrder order : TraversalOrder.values()) {
                    assertThat(dfs.traverse(tree, order).visitOrder())
                            .as("%s of %s", order, values)
                            .hasSize(values.size())
                            .containsExactlyInAnyOrderElementsOf(values);
                }
            }
        }
    }
}
