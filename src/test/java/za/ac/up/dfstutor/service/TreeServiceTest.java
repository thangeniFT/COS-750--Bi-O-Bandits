package za.ac.up.dfstutor.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import za.ac.up.dfstutor.config.TutorProperties;
import za.ac.up.dfstutor.dto.ErrorCode;
import za.ac.up.dfstutor.dto.TreeView;
import za.ac.up.dfstutor.model.DepthFirstSearch;
import za.ac.up.dfstutor.model.StepExplanations;

/**
 * Tests for {@link TreeService}: the sandbox tree and the rules on values (BR-1, BR-4, BR-5).
 * Runs without Spring, so it is fast.
 */
class TreeServiceTest {

    private static final List<Integer> EXAMPLE = List.of(50, 30, 70, 20, 40, 60, 80);

    private static TreeService service(int maxNodes) {
        TutorProperties properties = new TutorProperties(0, 99, maxNodes, EXAMPLE);
        return new TreeService(properties, new DepthFirstSearch(new StepExplanations()));
    }

    private static TreeService service() {
        return service(15);
    }

    /** Asserts that the code throws a {@link TutorException} with the given code. */
    private static void assertRejected(Runnable code, ErrorCode expected) {
        assertThatThrownBy(code::run)
                .isInstanceOf(TutorException.class)
                .extracting(e -> ((TutorException) e).getCode())
                .isEqualTo(expected);
    }

    @Test
    @DisplayName("starts with the example tree")
    void startsWithExampleTree() {
        TreeView tree = service().getTree();

        assertThat(tree.root().value()).isEqualTo(50);
        assertThat(tree.size()).isEqualTo(7);
        assertThat(tree.height()).isEqualTo(3);
    }

    @Test
    @DisplayName("insert puts the value in the BST position")
    void insertAddsValue() {
        TreeView tree = service().insert(65);

        assertThat(tree.size()).isEqualTo(8);
        assertThat(tree.root().right().left().right().value()).isEqualTo(65);
    }

    @Test
    @DisplayName("duplicates are rejected (BR-4)")
    void duplicateRejected() {
        TreeService service = service();

        assertRejected(() -> service.insert(40), ErrorCode.DUPLICATE_VALUE);
        assertThat(service.getTree().size()).isEqualTo(7);
    }

    @Test
    @DisplayName("values outside 0..99 are rejected (BR-1)")
    void outOfRangeRejected() {
        TreeService service = service();

        assertRejected(() -> service.insert(100), ErrorCode.INVALID_NUMBER);
        assertRejected(() -> service.insert(-1), ErrorCode.INVALID_NUMBER);
        assertRejected(() -> service.search(150, null), ErrorCode.INVALID_NUMBER);
    }

    @Test
    @DisplayName("the node limit is enforced (BR-5)")
    void treeFullRejected() {
        TreeService service = service(8);

        service.insert(65);

        assertRejected(() -> service.insert(66), ErrorCode.TREE_FULL);
    }

    @Test
    @DisplayName("reset restores the example tree")
    void resetRestoresExample() {
        TreeService service = service();
        service.insert(65);

        TreeView tree = service.reset();

        assertThat(tree.size()).isEqualTo(7);
    }

    @Test
    @DisplayName("preview builds a separate tree and leaves the sandbox alone")
    void previewIsIndependent() {
        TreeService service = service();

        TreeView treeB = service.preview(List.of(45, 25, 65, 15, 35, 55, 30));

        assertThat(treeB.root().value()).isEqualTo(45);
        assertThat(treeB.root().left().right().left().value()).isEqualTo(30);
        assertThat(service.getTree().root().value()).isEqualTo(50);
    }

    @Test
    @DisplayName("preview applies the same rules as insert")
    void previewValidatesValues() {
        TreeService service = service(7);

        assertRejected(() -> service.preview(List.of(1, 2, 1)), ErrorCode.DUPLICATE_VALUE);
        assertRejected(() -> service.preview(List.of(1, 200)), ErrorCode.INVALID_NUMBER);
        assertRejected(() -> service.preview(Arrays.asList(1, null)), ErrorCode.INVALID_NUMBER);
        assertRejected(() -> service.preview(List.of(1, 2, 3, 4, 5, 6, 7, 8)), ErrorCode.TREE_FULL);
        assertThat(service.preview(List.of()).root()).isNull();
    }

    @Test
    @DisplayName("an unknown traversal order is rejected before DFS runs")
    void unknownOrderRejected() {
        assertRejected(() -> service().traverse("level-order", null), ErrorCode.INVALID_ORDER);
    }
}
