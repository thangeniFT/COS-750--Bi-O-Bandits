package za.ac.up.dfstutor.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tests for {@link DfsResult}, its builder, {@link DfsStep} and {@link TraversalOrder}: the
 * plumbing the DFS tickets build on.
 */
class DfsResultTest {

    @Test
    @DisplayName("the builder records visits in order and numbers the steps")
    void builderRecordsSteps() {
        DfsResult result = DfsResult.builder(TraversalOrder.PRE_ORDER, 60)
                .visit(50, List.of(30, 70), "first")
                .visit(30, List.of(20, 40, 70), "second")
                .found();

        assertThat(result.visitOrder()).containsExactly(50, 30);
        assertThat(result.nodesVisited()).isEqualTo(2);
        assertThat(result.steps()).extracting(DfsStep::number).containsExactly(1, 2);
        assertThat(result.found()).isTrue();
    }

    @Test
    @DisplayName("a recorded step keeps its stack even if the working stack changes later")
    void stepCopiesStack() {
        List<Integer> working = new ArrayList<>(List.of(30, 70));
        DfsResult.Builder builder = DfsResult.builder(TraversalOrder.PRE_ORDER, 60).visit(50, working, "x");

        working.clear();

        assertThat(builder.notFound().steps().getFirst().stackAfter()).containsExactly(30, 70);
    }

    @Test
    @DisplayName("searches finish with found/notFound, traversals with completed")
    void finishMethodsMatchKind() {
        assertThatThrownBy(() -> DfsResult.builder(TraversalOrder.IN_ORDER, null).found())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> DfsResult.builder(TraversalOrder.PRE_ORDER, 60).completed())
                .isInstanceOf(IllegalStateException.class);

        DfsResult traversal = DfsResult.builder(TraversalOrder.IN_ORDER, null).completed();
        assertThat(traversal.target()).isNull();
        assertThat(traversal.found()).isFalse();
    }

    @Test
    @DisplayName("JSON matches the API contract, including nodesVisited")
    void jsonShape() throws Exception {
        DfsResult result = DfsResult.builder(TraversalOrder.PRE_ORDER, 50)
                .visit(50, List.of(), "Visit 50. Found it.")
                .found();

        String json = new ObjectMapper().writeValueAsString(result);

        assertThat(json)
                .contains("\"order\":\"PRE_ORDER\"")
                .contains("\"target\":50")
                .contains("\"found\":true")
                .contains("\"visitOrder\":[50]")
                .contains("\"nodesVisited\":1")
                .contains("\"stackAfter\":[]");
    }

    @Test
    @DisplayName("TraversalOrder.parse accepts enum names and labels in any case")
    void parseTraversalOrder() {
        assertThat(TraversalOrder.parse("IN_ORDER")).isEqualTo(TraversalOrder.IN_ORDER);
        assertThat(TraversalOrder.parse("in-order")).isEqualTo(TraversalOrder.IN_ORDER);
        assertThat(TraversalOrder.parse(" post_order ")).isEqualTo(TraversalOrder.POST_ORDER);
        assertThatThrownBy(() -> TraversalOrder.parse("level-order")).isInstanceOf(IllegalArgumentException.class);
    }
}
