package za.ac.up.dfstutor.config;

import java.util.HashSet;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Tree limits and the example tree, read from the {@code tutor.*} keys in
 * {@code application.properties}.
 *
 * <p>Keeping these in configuration (rather than as constants scattered through the code) means
 * the business rules BR-1 and BR-5 from the SE document live in exactly one place. Tests can
 * override them with {@code @SpringBootTest(properties = "tutor.max-nodes=3")}.
 *
 * @param minValue    smallest value a node may hold (BR-1, default 0)
 * @param maxValue    largest value a node may hold (BR-1, default 99)
 * @param maxNodes    maximum number of nodes in a tree (BR-5, default 15)
 * @param exampleTree values inserted, in this order, to build the example tree (tree A in the
 *                    lesson); the shape of the tree depends on the order
 */
@ConfigurationProperties(prefix = "tutor")
public record TutorProperties(
        @DefaultValue("0") int minValue,
        @DefaultValue("99") int maxValue,
        @DefaultValue("15") int maxNodes,
        @DefaultValue({"50", "30", "70", "20", "40", "60", "80"}) List<Integer> exampleTree) {

    /**
     * Checks the configuration once at start-up so that a typo in {@code application.properties}
     * stops the application with a clear message instead of causing odd behaviour later.
     *
     * @throws IllegalArgumentException if the limits contradict each other or the example tree
     *                                  breaks them
     */
    public TutorProperties {
        if (minValue > maxValue) {
            throw new IllegalArgumentException("tutor.min-value must not be greater than tutor.max-value");
        }
        if (maxNodes < 1) {
            throw new IllegalArgumentException("tutor.max-nodes must be at least 1");
        }
        exampleTree = List.copyOf(exampleTree);
        if (exampleTree.size() > maxNodes) {
            throw new IllegalArgumentException("tutor.example-tree has more values than tutor.max-nodes allows");
        }
        if (new HashSet<>(exampleTree).size() != exampleTree.size()) {
            throw new IllegalArgumentException("tutor.example-tree must not contain duplicate values");
        }
        for (int value : exampleTree) {
            if (value < minValue || value > maxValue) {
                throw new IllegalArgumentException(
                        "tutor.example-tree value " + value + " is outside " + minValue + ".." + maxValue);
            }
        }
    }
}
