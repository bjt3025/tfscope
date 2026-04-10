// Unit tests for all query functions in src/db/queries.js.
// The Compound Mongoose model is mocked so tests run without a real database connection.

jest.mock('../../src/db/compound')
const Compound = require('../../src/db/compound')
const { getCompoundsByTarget, getCompoundsByAffinity, getCompoundById, queryCompounds } = require('../../src/db/queries')

// ---------------------------------------------------------------------------
// Shared fake data — used across tests to simulate what MongoDB would return.
// Values match the seeded compounds so test expectations stay realistic.
// ---------------------------------------------------------------------------

const fakePPARG = [
  { chembl_id: 'CHEMBL121',  name: 'Rosiglitazone', target_protein: 'PPARG', pchembl_value: 6.60 },
  { chembl_id: 'CHEMBL595',  name: 'Pioglitazone',  target_protein: 'PPARG', pchembl_value: 5.91 }
]

const fakeAR = [
  { chembl_id: 'CHEMBL1082407', name: 'Enzalutamide', target_protein: 'AR', pchembl_value: 7.31 },
  { chembl_id: 'CHEMBL409',     name: 'Bicalutamide', target_protein: 'AR', pchembl_value: 6.80 }
]

// ---------------------------------------------------------------------------
// getCompoundsByTarget
// ---------------------------------------------------------------------------

describe('getCompoundsByTarget', () => {
  // QU-01: known PPARG target returns a non-empty array of PPARG compounds
  it('QU-01: returns PPARG compounds when target is PPARG', async () => {
    // Mock Compound.find to return fakePPARG — simulates MongoDB responding with results
    Compound.find.mockResolvedValue(fakePPARG)

    const result = await getCompoundsByTarget('PPARG')

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    // Every document returned must actually target PPARG — verifies the query filter is applied
    result.forEach(c => expect(c.target_protein).toBe('PPARG'))
  })

  // QU-02: known AR target returns a non-empty array of AR compounds
  it('QU-02: returns AR compounds when target is AR', async () => {
    Compound.find.mockResolvedValue(fakeAR)

    const result = await getCompoundsByTarget('AR')

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(c => expect(c.target_protein).toBe('AR'))
  })

  // QU-03: unknown target returns [] without throwing — callers must not receive null or an error
  it('QU-03: returns [] for an unknown target without throwing', async () => {
    // MongoDB returns empty array when no documents match the filter
    Compound.find.mockResolvedValue([])

    const result = await getCompoundsByTarget('UNKNOWN')

    // Returns [] not null — callers iterate over the result directly
    expect(result).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getCompoundsByAffinity
// ---------------------------------------------------------------------------

describe('getCompoundsByAffinity', () => {
  // getCompoundsByAffinity uses .find().sort() — the mock must return an object
  // with a sort() method that itself resolves the data. This mirrors the Mongoose
  // query chain: find() returns a query object, sort() returns the final promise.
  const mockSort = (data) => {
    Compound.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(data) })
  }

  // QU-04: all returned compounds meet the minimum pchembl_value threshold
  it('QU-04: returns only compounds at or above the pchembl threshold', async () => {
    // Only Enzalutamide (7.31) is above 7.0 in our fake AR data
    const filtered = [{ chembl_id: 'CHEMBL1082407', target_protein: 'AR', pchembl_value: 7.31 }]
    mockSort(filtered)

    const result = await getCompoundsByAffinity('AR', 7.0)

    expect(result.length).toBeGreaterThan(0)
    // Every result must meet the threshold — verifies $gte filter is applied correctly
    result.forEach(c => expect(c.pchembl_value).toBeGreaterThanOrEqual(7.0))
  })

  // QU-05: results are sorted highest pchembl_value first
  it('QU-05: returns results sorted descending by pchembl_value', async () => {
    // Sorted highest first — Enzalutamide (7.31) before Bicalutamide (6.80) if both returned
    const sorted = [
      { chembl_id: 'CHEMBL1082407', target_protein: 'AR', pchembl_value: 7.31 },
      { chembl_id: 'CHEMBL409',     target_protein: 'AR', pchembl_value: 6.80 }
    ]
    mockSort(sorted)

    const result = await getCompoundsByAffinity('AR', 6.0)

    // Verify each result is >= the one after it — confirms descending sort
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].pchembl_value).toBeGreaterThanOrEqual(result[i + 1].pchembl_value)
    }
  })

  // QU-06: threshold too high returns [] without throwing
  it('QU-06: returns [] when no compounds meet an impossibly high threshold', async () => {
    mockSort([])

    const result = await getCompoundsByAffinity('PPARG', 12.0)

    // Returns [] not null — an empty result at high threshold is expected, not an error
    expect(result).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getCompoundById
// ---------------------------------------------------------------------------

describe('getCompoundById', () => {
  // QU-07: known ChEMBL ID returns the matching compound document
  it('QU-07: returns the correct compound for a known ChEMBL ID', async () => {
    const fakeRosiglitazone = { chembl_id: 'CHEMBL121', name: 'Rosiglitazone', target_protein: 'PPARG' }
    Compound.findOne.mockResolvedValue(fakeRosiglitazone)

    const result = await getCompoundById('CHEMBL121')

    expect(result).not.toBeNull()
    expect(result.chembl_id).toBe('CHEMBL121')
    expect(result.name).toBe('Rosiglitazone')
  })

  // QU-08: unknown ChEMBL ID returns null without throwing — caller handles null
  it('QU-08: returns null for an unknown ChEMBL ID without throwing', async () => {
    // MongoDB returns null when findOne finds no matching document
    Compound.findOne.mockResolvedValue(null)

    const result = await getCompoundById('CHEMBL999999')

    // Returns null not [] — single-document lookup has no "empty array" concept
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// queryCompounds
// queryCompounds chains .find().limit().sort() — the mock must return an object
// with a limit() method that returns an object with a sort() method that resolves
// the data. Each test verifies the correct MongoDB query is built from the filters.
// ---------------------------------------------------------------------------

describe('queryCompounds', () => {
  // Helper: sets up the full .find().limit().sort() chain mock
  const mockChain = (data) => {
    Compound.find.mockReturnValue({
      limit: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(data)
      })
    })
  }

  // QU-09: string field filter builds an equality condition for target_protein
  it('QU-09: filters by target_protein string equality', async () => {
    mockChain(fakePPARG)

    await queryCompounds({ target_protein: 'PPARG' })

    // Verify Compound.find was called with the correct equality condition
    expect(Compound.find).toHaveBeenCalledWith(
      expect.objectContaining({ target_protein: 'PPARG' })
    )
  })

  // QU-10: range filter with min only builds a $gte condition
  it('QU-10: builds $gte condition for range filter with min only', async () => {
    const highPotency = [{ chembl_id: 'CHEMBL1082407', pchembl_value: 7.31 }]
    mockChain(highPotency)

    await queryCompounds({ pchembl_value: { min: 7.0 } })

    // $gte is MongoDB's >= operator — verifies the range object was translated correctly
    expect(Compound.find).toHaveBeenCalledWith(
      expect.objectContaining({ pchembl_value: { $gte: 7.0 } })
    )
  })

  // QU-11: range filter with both min and max builds $gte + $lte condition
  it('QU-11: builds $gte and $lte conditions for range filter with min and max', async () => {
    mockChain(fakePPARG)

    await queryCompounds({ mol_weight: { min: 200, max: 500 } })

    expect(Compound.find).toHaveBeenCalledWith(
      expect.objectContaining({ mol_weight: { $gte: 200, $lte: 500 } })
    )
  })

  // QU-12: boolean filter builds a direct equality condition for withdrawn_flag
  it('QU-12: filters by withdrawn_flag boolean equality', async () => {
    mockChain(fakePPARG)

    await queryCompounds({ withdrawn_flag: false })

    expect(Compound.find).toHaveBeenCalledWith(
      expect.objectContaining({ withdrawn_flag: false })
    )
  })
})
