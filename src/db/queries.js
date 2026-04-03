// This file contains all MongoDB query functions for the compounds collection.
// Each function is called by a corresponding MCP tool handler in src/mcp/handlers.js and returns real compound data from Atlas.

const Compound = require('./compound')

/**
 * @description Returns all compounds in the database that target a given protein.
 * @calledBy handlers.js → searchByTarget()
 * @calls Compound.find({ target_protein })
 * @returns {Promise<Array>} Array of matching compound documents, or [] if none found
 * @errorHandling Returns [] on no results rather than null — callers in handlers.js
 *   always expect an array they can safely pass to the frontend. Throwing here would
 *   require every caller to add its own try/catch for a non-error condition (empty results).
 */
async function getCompoundsByTarget(target) {
  // Query MongoDB for all compounds whose target_protein matches exactly.
  // No sort applied — order is not meaningful when returning the full set for a target.
  const compounds = await Compound.find({ target_protein: target })

  // Returns [] not null — callers expect an array they can pass directly to the frontend
  // without a null check. An unknown target (e.g. "EGFR") simply returns an empty array.
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

module.exports = { getCompoundsByTarget, getCompoundsByAffinity, getCompoundById }
