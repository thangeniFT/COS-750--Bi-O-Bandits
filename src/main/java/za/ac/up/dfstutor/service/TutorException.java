package za.ac.up.dfstutor.service;

import java.util.Objects;

import za.ac.up.dfstutor.dto.ErrorCode;

/**
 * A rule broken by the student's input, such as a duplicate value or a number out of range.
 *
 * <p>Throw this from the service layer with a message written for students.
 * {@link za.ac.up.dfstutor.controller.ApiExceptionHandler} turns it into an
 * {@link za.ac.up.dfstutor.dto.ApiError} with the right HTTP status, so controllers never need
 * try/catch blocks.
 *
 * <pre>{@code
 * throw new TutorException(ErrorCode.DUPLICATE_VALUE,
 *         "40 is already in the tree. Each value can appear only once in this BST.");
 * }</pre>
 */
public class TutorException extends RuntimeException {

    private final ErrorCode code;

    /**
     * Creates the exception.
     *
     * @param code    the machine-readable error code
     * @param message a short, friendly sentence the frontend can show as it is
     */
    public TutorException(ErrorCode code, String message) {
        super(message);
        this.code = Objects.requireNonNull(code, "code");
    }

    /**
     * Returns the error code that decides the HTTP status and lets the frontend react.
     *
     * @return the error code
     */
    public ErrorCode getCode() {
        return code;
    }
}
