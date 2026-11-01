package za.ac.up.dfstutor.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import za.ac.up.dfstutor.model.DepthFirstSearch;
import za.ac.up.dfstutor.model.StepExplanations;

/**
 * Registers the plain-Java domain classes as Spring beans.
 *
 * <p>The classes in the {@code model} package deliberately have no Spring annotations (NFR-07),
 * so they can be unit-tested with a plain {@code new}. This class is the only place that turns
 * them into beans, so the rest of the application can have them injected.
 */
@Configuration
public class TutorConfig {

    /**
     * Provides the learner-facing wording for each DFS step.
     *
     * @return a stateless explanation generator shared by the whole application
     */
    @Bean
    public StepExplanations stepExplanations() {
        return new StepExplanations();
    }

    /**
     * Provides the DFS algorithm.
     *
     * @param explanations the wording used for each recorded step
     * @return a stateless DFS implementation shared by the whole application
     */
    @Bean
    public DepthFirstSearch depthFirstSearch(StepExplanations explanations) {
        return new DepthFirstSearch(explanations);
    }
}
