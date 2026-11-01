package za.ac.up.dfstutor.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

/**
 * Body of {@code POST /api/tree/preview}, for example {@code {"values": [45, 25, 65, 15, 35, 55, 30]}}.
 *
 * <p>Builds a tree from the values (inserted in order) and returns its shape for drawing, without
 * storing it. The lesson uses this to draw tree A and tree B so the BST insertion logic stays in
 * Java and is not duplicated in JavaScript.
 *
 * @param values the insertion order; may be empty (an empty tree)
 */
public record PreviewRequest(@NotNull(message = "Provide a list of values.") List<Integer> values) {
}
