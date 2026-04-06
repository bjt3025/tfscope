// Unit tests for the three MCP handler functions in src/mcp/handlers.js.
// The query functions (src/db/queries.js) are mocked so these tests verify handler
// behavior in isolation — input shaping, output wrapping, and error handling — without
// touching the database.

jest.mock('../../src/db/queries')
const { getCompoundsByTarget, getCompoundsByAffinity, getCompoundById } = require('../../src/db/queries')
const { searchByTarget, filterByAffinity, getCompoundDetails } = require('../../src/mcp/handlers')

// ---------------------------------------------------------------------------
// Shared fake data
// ---------------------------------------------------------------------------

const fakeCompounds = [
  { chembl_id: 'CHEMBL121',  name: 'Rosiglitazone', target_protein: 'PPARG', pchembl_value: 6.60 },
  { chembl_id: 'CHEMBL595',  name: 'Pioglitazone',  target_protein: 'PPARG', pchembl_value: 5.91 }
]

const fakeCompound = { chembl_id: 'CHEMBL121', name: 'Rosiglitazone', target_protein: 'PPARG' }

// ---------------------------------------------------------------------------
// searchByTarget
// ---------------------------------------------------------------------------

describe('searchByTarget', () => {
  // HU-01: handler wraps query results in { compounds } and returns them
  it('HU-01: returns { compounds: [...] } for a valid target', async () => {
    // Mock getCompoundsByTarget to return fake PPARG compounds
    getCompoundsByTarget.mockResolvedValue(fakeCompounds)

    const result = await searchByTarget({ target: 'PPARG' })

    // Handler must return { compounds } shape — server.js and frontend rely on this key
    expect(result).toHaveProperty('compounds')
    expect(Array.isArray(result.compounds)).toBe(true)
    expect(result.compounds.length).toBe(2)
    // No error key on success — caller can check for absence of error to confirm success
    expect(result.error).toBeUndefined()
  })

  // Error case: query throws unexpectedly — handler must not propagate the throw
  it('returns { compounds: [], error } if query throws', async () => {
    getCompoundsByTarget.mockRejectedValue(new Error('DB connection lost'))

    const result = await searchByTarget({ target: 'PPARG' })

    // Structured error prevents server.js from crashing the entire request
    expect(result.compounds).toEqual([])
    expect(result.error).toBe('DB connection lost')
  })
})

// ---------------------------------------------------------------------------
// filterByAffinity
// ---------------------------------------------------------------------------

describe('filterByAffinity', () => {
  // HU-02: handler passes target and min_pchembl to query and wraps result in { compounds }
  it('HU-02: returns filtered compounds array for valid input', async () => {
    // Only Rosiglitazone (6.60) would pass a threshold of 6.0 in this fake set
    const filtered = [fakeCompounds[0]]
    getCompoundsByAffinity.mockResolvedValue(filtered)

    const result = await filterByAffinity({ target: 'PPARG', min_pchembl: 6.0 })

    expect(result).toHaveProperty('compounds')
    expect(Array.isArray(result.compounds)).toBe(true)
    // Verify the query function was called with the correct arguments from input
    expect(getCompoundsByAffinity).toHaveBeenCalledWith('PPARG', 6.0)
    expect(result.error).toBeUndefined()
  })

  // Error case: structured error returned, never thrown
  it('returns { compounds: [], error } if query throws', async () => {
    getCompoundsByAffinity.mockRejectedValue(new Error('Timeout'))

    const result = await filterByAffinity({ target: 'PPARG', min_pchembl: 7.0 })

    expect(result.compounds).toEqual([])
    expect(result.error).toBe('Timeout')
  })
})

// ---------------------------------------------------------------------------
// getCompoundDetails
// ---------------------------------------------------------------------------

describe('getCompoundDetails', () => {
  // HU-03: known ChEMBL ID returns { compound: { ... } }
  it('HU-03: returns { compound: { ... } } for a known ChEMBL ID', async () => {
    getCompoundById.mockResolvedValue(fakeCompound)

    const result = await getCompoundDetails({ chembl_id: 'CHEMBL121' })

    // Handler must return { compound } shape — not the raw document
    expect(result).toHaveProperty('compound')
    expect(result.compound.chembl_id).toBe('CHEMBL121')
    expect(result.error).toBeUndefined()
  })

  // HU-04: unknown ChEMBL ID returns { compound: null, error } without throwing.
  // This is the expected "not found" path — not an unexpected error.
  it('HU-04: returns { compound: null, error } for an unknown ChEMBL ID without throwing', async () => {
    // getCompoundById returns null when the document doesn't exist in MongoDB
    getCompoundById.mockResolvedValue(null)

    const result = await getCompoundDetails({ chembl_id: 'CHEMBL999999' })

    // compound is null (not []) — single-document lookup has no "empty array" concept
    expect(result.compound).toBeNull()
    // error must be present so Claude can generate a "not found" message for the user
    expect(result.error).toBe('Compound not found')
  })
})
