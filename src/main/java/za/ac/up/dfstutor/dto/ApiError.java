package za.ac.up.dfstutor.dto;

/**
 * The JSON body of every error response, for example:
 * <pre>{@code
 * { "error": "DUPLICATE_VALUE",
 *   "message": "40 is already in the tree. Each value can appear only once in this BST." }
 * }</pre>
 *
 * <p>The message is written for students and can be shown on screen as it is (NFR-04). It must
 * never contain a stack trace or class names.
 *
 * @param error   the machine-readable code, one of {@link ErrorCode}
 * @param message a short, friendly sentence that says what went wrong and what to do
 */
public record ApiError(ErrorCode error, String message) {
}
