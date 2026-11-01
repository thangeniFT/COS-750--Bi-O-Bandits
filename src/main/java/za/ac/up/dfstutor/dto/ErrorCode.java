package za.ac.up.dfstutor.dto;

import org.springframework.http.HttpStatus;

/**
 * Every error the API can report, with the HTTP status it is sent with.
 *
 * <p>The frontend switches on the code (the {@code "error"} field of {@link ApiError}), never on the
 * message text, so messages can be reworded freely. Adding a code here means adding a case to the
 * frontend's error handling too ({@code static/js/api.js}).
 */
public enum ErrorCode {

    /** A required field ({@code value}, {@code target} or {@code order}) is missing or null. */
    MISSING_VALUE(HttpStatus.BAD_REQUEST),

    /** A value is not a whole number, or is outside the allowed range (BR-1). */
    INVALID_NUMBER(HttpStatus.BAD_REQUEST),

    /** The traversal order is not PRE_ORDER, IN_ORDER or POST_ORDER. */
    INVALID_ORDER(HttpStatus.BAD_REQUEST),

    /** The value is already in the tree (BR-4). */
    DUPLICATE_VALUE(HttpStatus.BAD_REQUEST),

    /** The tree already holds the maximum number of nodes (BR-5). */
    TREE_FULL(HttpStatus.BAD_REQUEST),

    /** The request body is not valid JSON, or has fields the API does not know. */
    INVALID_JSON(HttpStatus.BAD_REQUEST),

    /** The feature exists in the API but its backlog ticket is not done yet. Skeleton only. */
    NOT_IMPLEMENTED(HttpStatus.NOT_IMPLEMENTED),

    /** Anything unexpected. Details go to the server log, never to the student. */
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus status;

    ErrorCode(HttpStatus status) {
        this.status = status;
    }

    /**
     * Returns the HTTP status sent with this error.
     *
     * @return the status, for example 400 Bad Request
     */
    public HttpStatus status() {
        return status;
    }
}
