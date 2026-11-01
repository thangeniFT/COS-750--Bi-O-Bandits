package za.ac.up.dfstutor.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Body of {@code POST /api/tree/insert}, for example {@code {"value": 65}}.
 *
 * <p>The field is an {@link Integer} rather than an {@code int} so that a missing value is
 * detected (it arrives as {@code null}) instead of silently becoming 0. The range check
 * (0 to 99 by default) happens in the service, because the limits come from configuration.
 *
 * @param value the whole number to insert
 */
public record InsertRequest(@NotNull(message = "Enter a whole number to insert.") Integer value) {
}
