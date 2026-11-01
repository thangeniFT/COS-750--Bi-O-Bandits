package za.ac.up.dfstutor.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

/**
 * Body of {@code POST /api/dfs/search}.
 *
 * <p>Two ways to call it:
 * <ul>
 *   <li>{@code {"target": 60}} searches the shared sandbox tree (the one changed by insert/reset).</li>
 *   <li>{@code {"target": 55, "values": [45, 25, 65, 15, 35, 55, 30]}} builds a temporary tree from
 *       {@code values} (inserted in that order), searches it and throws it away. Lesson, practice
 *       and quiz screens use this so that a student's sandbox edits can never change the trees
 *       the lesson text talks about.</li>
 * </ul>
 *
 * @param target the value to search for
 * @param values optional insertion order for a temporary tree; {@code null} means "use the sandbox tree"
 */
public record SearchRequest(
        @NotNull(message = "Enter a whole number to search for.") Integer target,
        List<Integer> values) {
}
