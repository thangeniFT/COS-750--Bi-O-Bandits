package za.ac.up.dfstutor.controller;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import za.ac.up.dfstutor.dto.InsertRequest;
import za.ac.up.dfstutor.dto.PreviewRequest;
import za.ac.up.dfstutor.dto.SearchRequest;
import za.ac.up.dfstutor.dto.TraverseRequest;
import za.ac.up.dfstutor.dto.TreeView;
import za.ac.up.dfstutor.model.DfsResult;
import za.ac.up.dfstutor.service.TreeService;

/**
 * The JSON API used by the browser. Every endpoint lives under {@code /api}.
 *
 * <table>
 *   <caption>Endpoints</caption>
 *   <tr><th>Method</th><th>Path</th><th>Body</th><th>Returns</th></tr>
 *   <tr><td>GET</td><td>/api/tree</td><td>none</td><td>{@link TreeView} of the sandbox tree</td></tr>
 *   <tr><td>POST</td><td>/api/tree/insert</td><td>{@code {"value": 65}}</td><td>updated {@link TreeView}</td></tr>
 *   <tr><td>POST</td><td>/api/tree/reset</td><td>none</td><td>the example tree</td></tr>
 *   <tr><td>POST</td><td>/api/tree/preview</td><td>{@code {"values": [45, 25, 65]}}</td><td>{@link TreeView}, not stored</td></tr>
 *   <tr><td>POST</td><td>/api/dfs/search</td><td>{@code {"target": 60, "values": [...]?}}</td><td>{@link DfsResult}</td></tr>
 *   <tr><td>POST</td><td>/api/dfs/traverse</td><td>{@code {"order": "IN_ORDER", "values": [...]?}}</td><td>{@link DfsResult}</td></tr>
 * </table>
 *
 * <p>Controllers stay thin: they unpack the request, call {@link TreeService} and return the result.
 * Validation of rules happens in the service; turning exceptions into error JSON happens in
 * {@link ApiExceptionHandler}. Do not add try/catch blocks here.
 *
 * <p><b>Status:</b> implemented. The two {@code /api/dfs} endpoints answer 501 until backlog
 * tickets B-01 and B-02 are done.
 */
@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class TreeController {

    private final TreeService service;

    /**
     * Creates the controller.
     *
     * @param service the service that owns the tree and runs DFS
     */
    public TreeController(TreeService service) {
        this.service = service;
    }

    /**
     * {@code GET /api/tree}: returns the sandbox tree so the browser can draw it.
     *
     * @return the current sandbox tree
     */
    @GetMapping("/tree")
    public TreeView getTree() {
        return service.getTree();
    }

    /**
     * {@code POST /api/tree/insert}: inserts one value into the sandbox tree.
     *
     * @param request the value to insert
     * @return the updated tree; errors are 400 with {@code MISSING_VALUE}, {@code INVALID_NUMBER},
     *         {@code DUPLICATE_VALUE} or {@code TREE_FULL}
     */
    @PostMapping("/tree/insert")
    public TreeView insert(@Valid @RequestBody InsertRequest request) {
        return service.insert(request.value());
    }

    /**
     * {@code POST /api/tree/reset}: replaces the sandbox tree with the example tree.
     *
     * @return the example tree
     */
    @PostMapping("/tree/reset")
    public TreeView reset() {
        return service.reset();
    }

    /**
     * {@code POST /api/tree/preview}: builds a tree from values and returns its shape without
     * storing it. Used to draw the lesson's fixed trees (tree A, tree B).
     *
     * @param request the insertion order
     * @return the shape of the tree
     */
    @PostMapping("/tree/preview")
    public TreeView preview(@Valid @RequestBody PreviewRequest request) {
        return service.preview(request.values());
    }

    /**
     * {@code POST /api/dfs/search}: runs a DFS search on the sandbox tree, or on a temporary tree if
     * {@code values} is given.
     *
     * @param request the target and optional values
     * @return the search result, including every step for the step player
     */
    @PostMapping("/dfs/search")
    public DfsResult search(@Valid @RequestBody SearchRequest request) {
        return service.search(request.target(), request.values());
    }

    /**
     * {@code POST /api/dfs/traverse}: runs a DFS traversal in the requested order.
     *
     * @param request the order and optional values
     * @return the traversal result, including every step for the step player
     */
    @PostMapping("/dfs/traverse")
    public DfsResult traverse(@Valid @RequestBody TraverseRequest request) {
        return service.traverse(request.order(), request.values());
    }
}
