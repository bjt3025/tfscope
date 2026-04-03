// Mongoose schema and model for the compounds collection
const mongoose = require('mongoose')

// Define the shape of a compound document
const compoundSchema = new mongoose.Schema({
  // --- Compound identity ---
  chembl_id: String,
  name: String,
  smiles: String,        // molecular structure as a text string
  inchi_key: String,      // unique molecular identifier

  // --- Target protein this compound acts on ---
  target_protein: String,
  target_chembl_id: String,
  target_full_name: String,

  // --- Assay info (how the compound was tested) ---
  assay_chembl_id: String,
  assay_description: String,
  assay_type: String,
  document_journal: String,
  document_year: Number,

  // --- Activity data (how strongly it binds/acts) ---
  standard_value: Number,
  standard_relation: String,
  standard_units: String,
  pchembl_value: Number,
  ligand_efficiency: {
    bei: Number,
    le: Number,
    lle: Number,
    sei: Number
  },

  // --- Physical/chemical properties ---
  mol_weight: Number,
  alogp: Number,          // how water-soluble vs fat-soluble
  hba: Number,            // hydrogen bond acceptors
  hbd: Number,            // hydrogen bond donors
  psa: Number,            // polar surface area
  qed_weighted: Number,   // drug-likeness score (0 to 1)
  num_ro5_violations: Number,

  // --- Approval status ---
  max_phase: Number,       // 4 = fully approved drug
  first_approval: Number,
  withdrawn_flag: Boolean,

  // --- Metadata ---
  source: String,
  created_at: Date
})

// Create and export the model
// 'Compound' maps to the 'compounds' collection in MongoDB
module.exports = mongoose.model('Compound', compoundSchema)