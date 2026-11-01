package za.ac.up.dfstutor.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

/**
 * Body of {@code POST /api/dfs/traverse}, for example {@code {"order": "IN_ORDER"}}.
 *
 * <p>{@code order} is a {@link String}, not the enum, so that an unknown order produces our own
 * friendly {@link ErrorCode#INVALID_ORDER} instead of a generic JSON parsing error.
 *
 * @param order  {@code PRE_ORDER}, {@code IN_ORDER} or {@code POST_ORDER} (case-insensitive;
 *               {@code "in-order"} also works)
 * @param values optional insertion order for a temporary tree; {@code null} means "use the sandbox
 *               tree" (see {@link SearchRequest})
 */
public record TraverseRequest(
        @NotBlank(message = "Choose pre-order, in-order or post-order.") String order,
        List<Integer> values) {
}
