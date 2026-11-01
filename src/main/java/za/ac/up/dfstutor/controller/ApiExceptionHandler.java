package za.ac.up.dfstutor.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;

import za.ac.up.dfstutor.dto.ApiError;
import za.ac.up.dfstutor.dto.ErrorCode;
import za.ac.up.dfstutor.service.TutorException;

/**
 * Turns every exception thrown while handling an API request into an {@link ApiError} with a
 * friendly message and the right HTTP status (NFR-04: no raw Java exceptions in the browser).
 *
 * <p>This is the only place that decides how errors look. If you add a new kind of failure, throw a
 * {@link TutorException} with a new {@link ErrorCode}; you should not need to change this class.
 *
 * <p>Scoped to the controller package, so it does not interfere with Spring's handling of static
 * files (for example, a 404 for a missing image stays a normal 404).
 */
@RestControllerAdvice(basePackageClasses = TreeController.class)
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /**
     * Rules broken by the student's input (duplicate, out of range, tree full, unknown order).
     *
     * @param e the exception thrown by the service
     * @return the error with the status that belongs to its code
     */
    @ExceptionHandler(TutorException.class)
    public ResponseEntity<ApiError> handleTutorException(TutorException e) {
        return respond(e.getCode(), e.getMessage());
    }

    /**
     * A required field is missing or blank (a {@code @NotNull} or {@code @NotBlank} check failed).
     * The message comes from the annotation on the request record.
     *
     * @param e the validation failure
     * @return 400 with {@code MISSING_VALUE}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
        FieldError first = e.getBindingResult().getFieldError();
        String message = first != null && first.getDefaultMessage() != null
                ? first.getDefaultMessage()
                : "A required value is missing.";
        return respond(ErrorCode.MISSING_VALUE, message);
    }

    /**
     * The body could not be read as the expected JSON: it is missing, malformed, has an unknown
     * field, or has text where a whole number was expected (for example {@code "abc"} or {@code 3.5}).
     *
     * @param e the parsing failure
     * @return 400 with {@code INVALID_NUMBER} or {@code INVALID_JSON}
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException e) {
        Throwable cause = e.getCause();
        if (cause instanceof UnrecognizedPropertyException unknown) {
            return respond(ErrorCode.INVALID_JSON,
                    "The request has a field the app does not recognise: \"" + unknown.getPropertyName() + "\".");
        }
        if (cause instanceof MismatchedInputException) {
            return respond(ErrorCode.INVALID_NUMBER, "Values must be whole numbers, for example 42.");
        }
        return respond(ErrorCode.INVALID_JSON, "The request was missing or was not valid JSON.");
    }

    /**
     * A feature whose backlog ticket is not done yet. Lets the frontend show "coming soon" instead
     * of a crash while the team works through the backlog.
     *
     * @param e thrown by a stubbed method; its message names the ticket
     * @return 501 with {@code NOT_IMPLEMENTED}
     */
    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ApiError> handleNotImplemented(UnsupportedOperationException e) {
        return respond(ErrorCode.NOT_IMPLEMENTED,
                e.getMessage() != null ? e.getMessage() : "This feature is not implemented yet.");
    }

    /**
     * Anything else. Standard Spring MVC request errors (wrong content type, wrong HTTP method) keep
     * their 4xx status; everything unexpected is logged in full and reported as a generic 500.
     *
     * @param e the unexpected exception
     * @return a generic error that reveals no internal details
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception e) {
        if (e instanceof ErrorResponse springError && springError.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(springError.getStatusCode())
                    .body(new ApiError(ErrorCode.INVALID_JSON, "The request was not in the format the app expects."));
        }
        log.error("Unexpected error while handling an API request", e);
        return respond(ErrorCode.INTERNAL_ERROR, "Something went wrong on the server. Try again, or reset the tree.");
    }

    /**
     * Builds the response for an error code.
     *
     * @param code    the error code, which decides the HTTP status
     * @param message the student-facing message
     * @return the response entity
     */
    private static ResponseEntity<ApiError> respond(ErrorCode code, String message) {
        return ResponseEntity.status(code.status()).body(new ApiError(code, message));
    }
}
