package za.ac.up.dfstutor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point of the COS212 DFS Tutor.
 *
 * <p>Starting this class starts an embedded web server on port 8080 (see
 * {@code application.properties}). It serves two things:
 * <ul>
 *   <li>the static frontend in {@code src/main/resources/static} at {@code http://localhost:8080/}, and</li>
 *   <li>the JSON API under {@code /api}, implemented by
 *       {@link za.ac.up.dfstutor.controller.TreeController}.</li>
 * </ul>
 *
 * <p>Run it with {@code ./mvnw spring-boot:run} or from your IDE by running {@link #main}.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
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
