package za.ac.up.dfstutor.controller;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.mock.web.MockHttpSession;


/**
 * End-to-end tests of the JSON API: real Spring context, real service, fake HTTP (MockMvc).
 *
 * <p>These check the contract the frontend relies on: URLs, JSON field names, status codes and
 * error codes. The nested DFS classes are disabled until backlog tickets B-01 and B-02 are done.
 */
@SpringBootTest
@AutoConfigureMockMvc
class TreeControllerTest {

    @Autowired
    private MockMvc mvc;

    /** Sends a JSON POST request. */
    private ResultActions postJson(String path, String json) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    @DisplayName("GET /api/tree returns the example tree")
    void getTree() throws Exception {
        mvc.perform(get("/api/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.root.value").value(50))
                .andExpect(jsonPath("$.root.left.value").value(30))
                .andExpect(jsonPath("$.size").value(7))
                .andExpect(jsonPath("$.height").value(3));
    }

    @Test
    @DisplayName("insert adds a node")
    void insert() throws Exception {
        postJson("/api/tree/insert", "{\"value\": 65}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(8))
                .andExpect(jsonPath("$.root.right.left.right.value").value(65));
    }

    @Test
    @DisplayName("each HTTP session has its own sandbox tree (B-04)")
    void sandboxIsIsolatedPerSession() throws Exception {
        MockHttpSession sessionA = new MockHttpSession();
        MockHttpSession sessionB = new MockHttpSession();

        mvc.perform(post("/api/tree/insert")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\": 65}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(8));

        mvc.perform(post("/api/tree/insert")
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\": 55}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(8));

        mvc.perform(get("/api/tree").session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.root.right.left.right.value").value(65))
                .andExpect(jsonPath("$.size").value(8));

        mvc.perform(get("/api/tree").session(sessionB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.root.right.left.left.value").value(55))
                .andExpect(jsonPath("$.size").value(8));
    }

    @Test
    @DisplayName("insert rejects a duplicate with DUPLICATE_VALUE")
    void insertDuplicate() throws Exception {
        postJson("/api/tree/insert", "{\"value\": 40}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("DUPLICATE_VALUE"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("insert rejects a missing value with MISSING_VALUE")
    void insertMissing() throws Exception {
        postJson("/api/tree/insert", "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("MISSING_VALUE"));
    }

    @Test
    @DisplayName("insert rejects text, decimals and out-of-range numbers with INVALID_NUMBER")
    void insertInvalidNumbers() throws Exception {
        for (String body : new String[] {"{\"value\": \"abc\"}", "{\"value\": 3.5}", "{\"value\": 150}"}) {
            postJson("/api/tree/insert", body)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("INVALID_NUMBER"));
        }
    }

    @Test
    @DisplayName("malformed JSON and unknown fields give INVALID_JSON")
    void invalidJson() throws Exception {
        postJson("/api/tree/insert", "{value:")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_JSON"));
        postJson("/api/tree/insert", "{\"valeu\": 5}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_JSON"));
    }

    @Test
    @DisplayName("a body that is not JSON gets a friendly error, never a stack trace (NFR-04)")
    void wrongContentType() throws Exception {
        mvc.perform(post("/api/tree/insert").contentType(MediaType.TEXT_PLAIN).content("5"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.error").value("INVALID_JSON"))
                .andExpect(jsonPath("$.trace").doesNotExist());
    }

    @Test
    @DisplayName("reset restores the example tree")
    void reset() throws Exception {
        MockHttpSession session = new MockHttpSession();

        mvc.perform(post("/api/tree/insert")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\": 65}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(8));

        mvc.perform(post("/api/tree/reset").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(7));
    }

    @Test
    @DisplayName("preview draws tree B without changing the sandbox")
    void preview() throws Exception {
        postJson("/api/tree/preview", "{\"values\": [45, 25, 65, 15, 35, 55, 30]}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.root.value").value(45))
                .andExpect(jsonPath("$.root.right.left.value").value(55));

        mvc.perform(get("/api/tree")).andExpect(jsonPath("$.root.value").value(50));
    }

    @Test
    @DisplayName("traverse rejects an unknown order with INVALID_ORDER")
    void traverseUnknownOrder() throws Exception {
        postJson("/api/dfs/traverse", "{\"order\": \"LEVEL_ORDER\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_ORDER"));
    }

    @Nested
    @DisplayName("POST /api/dfs/search (backlog ticket B-01)")
    class Search {

        @Test
        @DisplayName("search for 60 on the sandbox tree")
        void searchSandbox() throws Exception {
            postJson("/api/dfs/search", "{\"target\": 60}")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.found").value(true))
                    .andExpect(jsonPath("$.nodesVisited").value(6))
                    .andExpect(jsonPath("$.visitOrder", contains(50, 30, 20, 40, 70, 60)))
                    .andExpect(jsonPath("$.steps[0].stackAfter", contains(30, 70)))
                    .andExpect(jsonPath("$.steps[0].explanation").isNotEmpty());
        }

        @Test
        @DisplayName("search for 55 on a temporary tree B")
        void searchGivenValues() throws Exception {
            postJson("/api/dfs/search", "{\"target\": 55, \"values\": [45, 25, 65, 15, 35, 55, 30]}")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodesVisited").value(7));
        }
    }

    @Nested
    @DisplayName("POST /api/dfs/traverse (backlog ticket B-02)")
    @Disabled("Enable together with DepthFirstSearchTest.Traversal (ticket B-02)")
    class Traverse {

        @Test
        @DisplayName("in-order traversal returns sorted values")
        void inOrder() throws Exception {
            postJson("/api/dfs/traverse", "{\"order\": \"in-order\"}")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.order").value("IN_ORDER"))
                    .andExpect(jsonPath("$.target").doesNotExist())
                    .andExpect(jsonPath("$.visitOrder", contains(20, 30, 40, 50, 60, 70, 80)));
        }
    }
}
