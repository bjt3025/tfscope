// CompoundCard.jsx — displays a single compound document as a data card.
// Receives a compound object from MongoDB (via the API) and renders its key
// fields in a structured layout.  SMILES is shown as plain text in Phase 1;
// RDKit.js SVG rendering is added in the optional Step 8D-opt.

/**
 * CompoundCard — renders one compound document as a card.
 *
 * @description Displays the fields most relevant to a drug discovery researcher:
 *   potency (pchembl_value), IC50, target, approval status, and structure (SMILES).
 *   Null/missing values are shown as "—" rather than blank or "null" so the card
 *   always looks intentional.
 * @calledBy MessageList — one card rendered per compound in a message
 * @param {object} props.compound  A compound document from MongoDB with fields:
 *   chembl_id, name, target_protein, pchembl_value, standard_value,
 *   standard_units, max_phase, withdrawn_flag, smiles, mol_weight, alogp
 * @returns {JSX.Element}
 */
function CompoundCard({ compound }) {
  const {
    chembl_id,
    name,
    target_protein,
    pchembl_value,
    standard_value,
    standard_units,
    max_phase,
    withdrawn_flag,
    smiles,
    mol_weight,
    alogp,
  } = compound

  // Helper: return the value if defined and not null, otherwise "—"
  // Used for every field so null MongoDB values don't render as "null"
  function display(value) {
    return value !== null && value !== undefined ? value : '—'
  }

  // Approval phase label — max_phase 4 means FDA-approved
  function phaseLabel(phase) {
    if (phase === null || phase === undefined) return '—'
    if (phase === 4) return 'Phase 4 (Approved)'
    return `Phase ${phase}`
  }

  return (
    <div className="compound-card">
      {/* Header: compound name and ChEMBL ID */}
      <div className="compound-card__header">
        <span className="compound-card__name">
          {name && name !== 'None' ? name : 'Unnamed compound'}
        </span>
        <span className="compound-card__id">{chembl_id}</span>
      </div>

      {/* Withdrawn warning — surfaced prominently because it affects safety context */}
      {withdrawn_flag && (
        <div className="compound-card__withdrawn">⚠️ Withdrawn from market</div>
      )}

      {/* Key data fields */}
      <table className="compound-card__table">
        <tbody>
          <tr>
            <th>Target</th>
            <td>{display(target_protein)}</td>
          </tr>
          <tr>
            <th>pChEMBL</th>
            {/* pchembl_value: -log10(IC50) — higher = more potent */}
            <td>{display(pchembl_value)}</td>
          </tr>
          <tr>
            <th>IC50</th>
            <td>
              {standard_value !== null && standard_value !== undefined
                ? `${standard_value} ${standard_units || 'nM'}`
                : '—'}
            </td>
          </tr>
          <tr>
            <th>Mol. Weight</th>
            <td>{display(mol_weight)}</td>
          </tr>
          <tr>
            <th>ALogP</th>
            <td>{display(alogp)}</td>
          </tr>
          <tr>
            <th>Max Phase</th>
            <td>{phaseLabel(max_phase)}</td>
          </tr>
        </tbody>
      </table>

      {/* SMILES — plain text in Phase 1; replaced with RDKit SVG in Step 8D-opt */}
      {smiles && (
        <div className="compound-card__smiles">
          <span className="compound-card__smiles-label">SMILES</span>
          <code className="compound-card__smiles-value">{smiles}</code>
        </div>
      )}
    </div>
  )
}

export default CompoundCard
