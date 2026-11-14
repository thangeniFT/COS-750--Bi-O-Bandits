package za.ac.up.dfstutor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the COS212 DFS Tutor.
 *
 * <p>Starting this class starts an embedded web server on port 8080 (see
 * {@code application.properties}) that serves the static frontend in
 * {@code src/main/resources/static} at {@code http://localhost:8080/}. The lesson logic runs
 * entirely in the browser; this application has no API and no domain layer.
 *
 * <p>Run it with {@code ./mvnw spring-boot:run} or from your IDE by running {@link #main}.
 */
@SpringBootApplication
public class DfsTutorApplication {

    /**
     * Starts the Spring application context and the embedded web server.
     *
     * @param args command-line arguments; for example {@code --server.port=8081} to change the port
     */
    public static void main(String[] args) {
        SpringApplication.run(DfsTutorApplication.class, args);
    }
}
