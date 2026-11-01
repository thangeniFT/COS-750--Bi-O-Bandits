/**
 * The only module that talks to the server. Screens call these functions instead of using
 * fetch() directly, so URLs and error handling live in one place.
 *
 * Every function returns a Promise. On failure it rejects with an {@link ApiError} whose `code`
 * matches the Java enum ErrorCode (MISSING_VALUE, INVALID_NUMBER, INVALID_ORDER, DUPLICATE_VALUE,
 * TREE_FULL, INVALID_JSON, NOT_IMPLEMENTED, INTERNAL_ERROR) or NETWORK if the server could not be
 * reached. The `message` is written for students and can be shown as it is.
 *
 * Status: implemented.
 * @module api
 */

/**
 * @typedef {object} NodeView
 * @property {number} value
 * @property {NodeView|null} left
 * @property {NodeView|null} right
 */

/**
 * @typedef {object} TreeView
 * @property {NodeView|null} root - null for an empty tree
 * @property {number} size - number of nodes
 * @property {number} height - number of levels
 */

/**
 * @typedef {object} DfsStep
 * @property {number} number - 1-based step number
 * @property {number} node - value visited in this step
 * @property {number[]} stackAfter - stack after the step, top first
 * @property {string} explanation - learner-facing sentence
 */

/**
 * @typedef {object} DfsResult
 * @property {'PRE_ORDER'|'IN_ORDER'|'POST_ORDER'} order
 * @property {number|null} target - null for a traversal
 * @property {boolean} found
 * @property {number[]} visitOrder
 * @property {number} nodesVisited
 * @property {DfsStep[]} steps
 */

/** An error returned by the API, with a code the UI can react to. */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status, or 0 if the server could not be reached
   * @param {string} code - error code, for example 'DUPLICATE_VALUE'
   * @param {string} message - student-facing message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Sends a request and parses the JSON reply.
 *
 * @param {'GET'|'POST'} method
 * @param {string} path - relative URL such as 'api/tree' (relative so the app works under any base path)
 * @param {object} [body] - sent as JSON when given
 * @returns {Promise<any>} the parsed JSON body
 * @throws {ApiError}
 */
async function request(method, path, body) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach the tutor. Is the server still running?');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Not JSON (for example an HTML error page). Handled below.
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? `HTTP_${response.status}`,
      data?.message ?? 'Something went wrong. Please try again.',
    );
  }
  return data;
}

/** Functions for each API endpoint. See TreeController.java for the server side. */
export const api = {
  /**
   * Gets the sandbox tree.
   * @returns {Promise<TreeView>}
   */
  getTree: () => request('GET', 'api/tree'),

  /**
   * Inserts a value into the sandbox tree.
   * @param {number} value
   * @returns {Promise<TreeView>} the updated tree
   */
  insert: (value) => request('POST', 'api/tree/insert', { value }),

  /**
   * Restores the sandbox to the example tree.
   * @returns {Promise<TreeView>}
   */
  reset: () => request('POST', 'api/tree/reset'),

  /**
   * Builds a tree from values without storing it (for the fixed lesson trees).
   * @param {number[]} values - insertion order
   * @returns {Promise<TreeView>}
   */
  preview: (values) => request('POST', 'api/tree/preview', { values }),

  /**
   * Runs a DFS search.
   * @param {number} target
   * @param {number[]} [values] - omit to search the sandbox tree
   * @returns {Promise<DfsResult>}
   */
  search: (target, values) => request('POST', 'api/dfs/search', values ? { target, values } : { target }),

  /**
   * Runs a DFS traversal.
   * @param {'PRE_ORDER'|'IN_ORDER'|'POST_ORDER'} order
   * @param {number[]} [values] - omit to traverse the sandbox tree
   * @returns {Promise<DfsResult>}
   */
  traverse: (order, values) => request('POST', 'api/dfs/traverse', values ? { order, values } : { order }),
};

/**
 * Loads one of the content files in static/data (lesson, trees, quiz-bank, glossary).
 *
 * @param {'lesson'|'trees'|'quiz-bank'|'glossary'} name
 * @returns {Promise<any>} the parsed JSON
 * @throws {Error} if the file is missing or not valid JSON
 */
export async function loadData(name) {
  const response = await fetch(`data/${name}.json`);
  if (!response.ok) {
    throw new Error(`Could not load data/${name}.json (HTTP ${response.status})`);
  }
  return response.json();
}
