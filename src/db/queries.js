// This file contains all MongoDB query functions for the compounds collection.
// Each function is called by a corresponding MCP tool handler in src/mcp/handlers.js and returns real compound data from Atlas.

const Compound = require('./compound')

/**
 * @description Returns all compounds in the database that target a given protein.
 * @calledBy handlers.js → searchByTarget()
 * @returns {Promise<Array>} Array of matching compound documents, or [] if none found
 * @errorHandling Returns [] on no results rather than null
 */
async function getCompoundsByTarget(target) {
  // Query MongoDB for all compounds whose target_protein matches exactly.
  const compounds = await Compound.find({ target_protein: target })
  // Returns [] not null — callers expect an array they can pass directly to the frontend
  return compounds
}

/**
 * @description Returns compounds for a target protein filtered by a minimum potency
 *   threshold, sorted from most to least potent.
 * @calledBy handlers.js → filterByAffinity()
 * @calls Compound.find() with $gte filter, .sort({ pchembl_value: -1 })
 * @returns {Promise<Array>} Array of matching compound documents sorted descending by
 *   pchembl_value, or [] if no compounds meet the threshold
 * @errorHandling Returns [] when no results meet the threshold — same rationale as
 *   getCompoundsByTarget. A threshold that's too high is not an error, just an empty result.
 *   Callers expect an array regardless.
 */
async function getCompoundsByAffinity(target, minPchembl) {
  // $gte is MongoDB's "greater than or equal to" operator — equivalent to SQL's >=.
  // Combined with target_protein match, this filters to compounds that both target
  // the right protein AND meet the minimum potency threshold.
  const compounds = await Compound.find({
    target_protein: target,
    pchembl_value: { $gte: minPchembl }
  }).sort({ pchembl_value: -1 })
  // sort -1 = descending — most potent compound (highest pchembl_value) appears first.
  // This ordering matters for the demo: "show me the most potent AR compounds" should
  // return the strongest binders at the top without the frontend needing to re-sort.

  // Returns [] not null — if threshold is too high (e.g. minPchembl: 99), no compounds
  // match and the caller receives an empty array rather than null or an exception.
  return compounds
}

/**
 * @description Returns a single compound document matching the given ChEMBL ID.
 * @calledBy handlers.js → getCompoundDetails()
 * @calls Compound.findOne({ chembl_id })
 * @returns {Promise<Object|null>} A single compound document, or null if not found
 * @errorHandling Returns null if the ID doesn't exist in the database — this is a
 *   valid non-error outcome (e.g. user asks about a compound not in our seed set).
 *   The caller in handlers.js is responsible for checking null and returning an
 *   appropriate message to the frontend. Unlike the array-returning functions above,
 *   null is the correct sentinel here because there is no "empty collection" concept
 *   for a single-document lookup.
 */
async function getCompoundById(chemblId) {
  // findOne returns the first matching document or null — no need to check array length.
  // chembl_id is unique per compound so at most one document will ever match.
  const compound = await Compound.findOne({ chembl_id: chemblId })

  // Returns null not [] — this is a single-document lookup, not a collection query.
  // Caller must check for null before accessing any fields on the result.
  return compound
}

/**
 * queryCompounds — dynamic multi-field compound query.
 *
 * @description Translates a filter object (built by Claude) into a MongoDB query.
 *   Each filter field can be a direct value (string/boolean → equality match) or
 *   a range object ({ min, max } → $gte / $lte).  Only fields Claude included in
 *   the filter object are added to the query — everything else is unconstrained.
 * @calledBy handlers.js → queryCompoundsHandler()
 * @calls Compound.find() with a dynamically constructed query object, optional sort
 * @param {object} filters     Filter criteria from Claude's tool input — see tools.js for shape
 * @param {string} sortBy      Field name to sort by e.g. "pchembl_value"
 * @param {string} sortOrder   "asc" or "desc" — defaults to "desc"
 * @param {number} limit       Max results to return — defaults to 20
 * @returns {Promise<Array>}   Array of matching compound documents, or [] if none match
 * @errorHandling Returns [] on no results rather than null — consistent with other query
 *   functions so callers never need to null-check before iterating.
 */
async function queryCompounds(filters = {}, sortBy, sortOrder = 'desc', limit = 20) {
  const query = {}

  // Numeric fields that support range queries ({ min, max }).
  // Each field maps to a real MongoDB document field name.
  const rangeFields = ['pchembl_value', 'mol_weight', 'max_phase', 'alogp', 'hbd', 'hba']

  // String and boolean fields that use direct equality matching.
  const equalityFields = ['target_protein', 'withdrawn_flag', 'chembl_id']

  // Build equality conditions — add field to query only if Claude included it
  for (const field of equalityFields) {
    if (filters[field] !== undefined && filters[field] !== null) {
      query[field] = filters[field]
    }
  }

  // Build range conditions — { min } → $gte, { max } → $lte, both together → $gte + $lte
  for (const field of rangeFields) {
    const range = filters[field]
    if (!range || typeof range !== 'object') continue // skip if Claude didn't include this field

    const condition = {}
    if (range.min !== undefined) condition.$gte = range.min  // greater than or equal to min
    if (range.max !== undefined) condition.$lte = range.max  // less than or equal to max

    // Only add to query if at least one bound was specified
    if (Object.keys(condition).length > 0) {
      query[field] = condition
    }
  }

  // Build the Mongoose query, apply optional sort and limit
  let mongoQuery = Compound.find(query).limit(limit)

  // Apply sort if Claude specified one — default to descending so highest values appear first
  if (sortBy) {
    const sortDirection = sortOrder === 'asc' ? 1 : -1
    mongoQuery = mongoQuery.sort({ [sortBy]: sortDirection })
  }

  return mongoQuery
}

module.exports = { getCompoundsByTarget, getCompoundsByAffinity, getCompoundById, queryCompounds }
