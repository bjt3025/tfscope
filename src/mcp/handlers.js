// This file contains the MCP tool handler functions — one per tool defined in tools.js.
// Each handler is called by server.js when Claude triggers a tool call, and is responsible for calling the correct query function and returning a consistently shaped result.

const { getCompoundsByTarget, getCompoundsByAffinity, getCompoundById, queryCompounds } = require('../db/queries')

/**
 * @description MCP handler for the search_by_target tool. Receives Claude's tool input,
 *   calls the query function, and returns a consistently shaped result object.
 * @calledBy server.js dispatchTool()
 * @calls getCompoundsByTarget() in src/db/queries.js
 * @returns {Promise<{ compounds: Array }>} Always returns an object with a compounds array —
 *   empty array on no results or error, never null
 * @errorHandling Returns { compounds: [], error: "message" } on failure rather than throwing.
 *   Rationale: server.js calls this inside a tool-use loop — a thrown error would crash the
 *   entire request. Returning a structured error lets server.js forward a graceful response
 *   to the user instead of an HTTP 500.
 */
async function searchByTarget(input) {
  try {
    // Call the query function with the target protein Claude extracted from the user's message.
    const compounds = await getCompoundsByTarget(input.target)

    // Wrap in { compounds } so server.js and the frontend always receive the same shape
    return { compounds }
  } catch (err) {
    // Return structured error — never throw. Caller expects { compounds } shape always.
    return { compounds: [], error: err.message } //Error is passed to Claude who can explain it to the user
  }
}

/**
 * @description MCP handler for the filter_by_affinity tool. Filters compounds by target
 *   protein and minimum pchembl_value threshold.
 * @calledBy server.js dispatchTool()
 * @calls getCompoundsByAffinity() in src/db/queries.js
 * @returns {Promise<{ compounds: Array }>} Compounds meeting the threshold, sorted descending
 *   by pchembl_value, or { compounds: [], error } on failure
 * @errorHandling Same rationale as searchByTarget — structured error prevents request crash.
 */
async function filterByAffinity(input) {
  try {
    // input.target and input.min_pchembl are both required fields in the tool schema —
    // Claude will always provide them. min_pchembl arrives as a number (not a string)
    // because the inputSchema declares it as type: "number".
    const compounds = await getCompoundsByAffinity(input.target, input.min_pchembl)

    return { compounds }
  } catch (err) {
    return { compounds: [], error: err.message }
  }
}

/**
 * @description MCP handler for the get_compound_details tool. Returns a single compound
 *   by ChEMBL ID, or a structured not-found response if the ID isn't in the database.
 * @calledBy server.js dispatchTool()
 * @calls getCompoundById() in src/db/queries.js
 * @returns {Promise<{ compound: Object|null }>} The compound document, or
 *   { compound: null, error: "Compound not found" } if the ID doesn't exist
 * @errorHandling Two distinct failure modes handled separately:
 *   1. Compound not in database — returns { compound: null, error } so Claude can tell
 *      the user the compound wasn't found rather than returning an empty response.
 *   2. Unexpected error — returns { compound: null, error } to prevent request crash.
 *   Both cases use null (not []) because this is a single-document lookup.
 */
async function getCompoundDetails(input) {
  try {
    const compound = await getCompoundById(input.chembl_id)

    // Explicit null check — getCompoundById returns null when the ID isn't in the database.
    // We surface this as a structured error so Claude can generate a "not found" message
    // for the user rather than silently returning an empty result.
    if (compound === null) {
      return { compound: null, error: 'Compound not found' }
    }

    return { compound }
  } catch (err) {
    return { compound: null, error: err.message }
  }
}

/**
 * queryCompoundsHandler — MCP handler for the query_compounds tool.
 *
 * @description Receives Claude's dynamically built filter object and passes it to
 *   queryCompounds() in db/queries.js. This handler supports range queries, multi-field
 *   filtering, and sorting — capabilities not available in the 3 original handlers.
 * @calledBy server.js dispatchTool()
 * @calls queryCompounds() in src/db/queries.js
 * @param {object} input              Claude's tool input object
 * @param {object} input.filters      Filter criteria — see tools.js query_compounds input_schema
 * @param {string} input.sort_by      Optional field to sort by
 * @param {string} input.sort_order   Optional "asc" or "desc"
 * @param {number} input.limit        Optional max results
 * @returns {Promise<{ compounds: Array }>} Matching compounds, or { compounds: [], error } on failure
 * @errorHandling Structured error return — same rationale as all other handlers. Never throws.
 */
async function queryCompoundsHandler(input) {
  try {
    const compounds = await queryCompounds(
      input.filters   || {},       // filter object Claude built — default to no filters
      input.sort_by,               // optional sort field
      input.sort_order || 'desc',  // default descending so highest values appear first
      input.limit      || 20       // default 20 results if Claude didn't specify
    )
    return { compounds }
  } catch (err) {
    return { compounds: [], error: err.message }
  }
}

module.exports = { searchByTarget, filterByAffinity, getCompoundDetails, queryCompoundsHandler }
