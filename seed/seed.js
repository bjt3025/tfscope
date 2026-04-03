require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../src/db/connection')

const compounds = [
  {
    chembl_id: "CHEMBL121",
    name: "ROSIGLITAZONE",
    target_protein: "PPARG",
    target_chembl_id: "CHEMBL235",
    target_full_name: "Peroxisome proliferator-activated receptor gamma",

    assay_chembl_id: "CHEMBL759452",
    assay_description: "In vitro binding affinity against human peroxisome proliferator activated receptor gamma",
    assay_type: "B",
    document_journal: "Bioorg Med Chem Lett",
    document_year: 2003,

    standard_value: 250.0,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 6.6,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CN(CCOc1ccc(CC2SC(=O)NC2=O)cc1)c1ccccn1",
    inchi_key: "YASAKCUCGLMORW-UHFFFAOYSA-N",

    mol_weight: 357.44,
    alogp: 2.49,
    hba: 6,
    hbd: 1,
    psa: 71.53,
    qed_weighted: 0.82,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 1999,
    withdrawn_flag: true,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL595",
    name: "PIOGLITAZONE",
    target_protein: "PPARG",
    target_chembl_id: "CHEMBL235",
    target_full_name: "Peroxisome proliferator-activated receptor gamma",

    assay_chembl_id: "CHEMBL760250",
    assay_description: "In vitro binding to peroxisome proliferator activated receptor gamma (PPAR gamma) using [3H]-BRL 49653 as radioligand in scintillation proximity assay (SPA)",
    assay_type: "B",
    document_journal: "J Med Chem",
    document_year: 1998,

    standard_value: 1230.27,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 5.91,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CCc1ccc(CCOc2ccc(CC3SC(=O)NC3=O)cc2)nc1",
    inchi_key: "HYAFETHFCAUJAY-UHFFFAOYSA-N",

    mol_weight: 356.45,
    alogp: 3.16,
    hba: 5,
    hbd: 1,
    psa: 68.29,
    qed_weighted: 0.83,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 1999,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL195743",
    name: "None",
    target_protein: "PPARG",
    target_chembl_id: "CHEMBL235",
    target_full_name: "Peroxisome proliferator-activated receptor gamma",

    assay_chembl_id: null,
    assay_description: null,
    assay_type: null,
    document_journal: null,
    document_year: null,

    standard_value: null,
    standard_relation: null,
    standard_units: "nM",
    pchembl_value: null,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "COc1ccc(Oc2ccc(C3(N4CCN(CCO)CC4)C(=O)NC(=O)NC3=O)cc2)cc1",
    inchi_key: "OCQPVQCJWDXDLQ-UHFFFAOYSA-N",

    mol_weight: 454.48,
    alogp: 0.66,
    hba: 8,
    hbd: 3,
    psa: 120.44,
    qed_weighted: 0.52,
    num_ro5_violations: null,

    max_phase: null,
    first_approval: null,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL2180676",
    name: "None",
    target_protein: "PPARG",
    target_chembl_id: "CHEMBL235",
    target_full_name: "Peroxisome proliferator-activated receptor gamma",

    assay_chembl_id: null,
    assay_description: null,
    assay_type: null,
    document_journal: null,
    document_year: null,

    standard_value: null,
    standard_relation: null,
    standard_units: "nM",
    pchembl_value: null,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CCCN1CCc2c(c3ccc(OC)cc3c3cc(OC)c(OC)cc23)C1",
    inchi_key: "FHDRHIKZJHDZPW-UHFFFAOYSA-N",

    mol_weight: 365.47,
    alogp: 4.79,
    hba: 4,
    hbd: null,
    psa: 30.93,
    qed_weighted: 0.61,
    num_ro5_violations: null,

    max_phase: null,
    first_approval: null,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL1082407",
    name: "ENZALUTAMIDE",
    target_protein: "AR",
    target_chembl_id: "CHEMBL1871",
    target_full_name: "Androgen receptor",

    assay_chembl_id: "CHEMBL2395387",
    assay_description: "Displacement of [3H]R1881 from AR in human MDA-MB-453 cells",
    assay_type: "B",
    document_journal: "J Med Chem",
    document_year: 2013,

    standard_value: 49.0,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 7.31,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CNC(=O)c1ccc(N2C(=S)N(c3ccc(C#N)c(C(F)(F)F)c3)C(=O)C2(C)C)cc1F",
    inchi_key: "WXCXUHSOUPDCQV-UHFFFAOYSA-N",

    mol_weight: 464.44,
    alogp: 3.99,
    hba: 4,
    hbd: 1,
    psa: 76.44,
    qed_weighted: 0.55,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 2012,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL409",
    name: "BICALUTAMIDE",
    target_protein: "AR",
    target_chembl_id: "CHEMBL1871",
    target_full_name: "Androgen receptor",

    assay_chembl_id: "CHEMBL884023",
    assay_description: "Antagonistic activity (IC50) against human androgen receptor (hAR) in co-transfected CV-1 cell",
    assay_type: "F",
    document_journal: "Bioorg Med Chem Lett",
    document_year: 1998,

    standard_value: 157.0,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 6.8,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CC(O)(CS(=O)(=O)c1ccc(F)cc1)C(=O)Nc1ccc(C#N)c(C(F)(F)F)c1",
    inchi_key: "LKJPYSCBVHEWIU-UHFFFAOYSA-N",

    mol_weight: 430.38,
    alogp: 2.88,
    hba: 5,
    hbd: 2,
    psa: 107.26,
    qed_weighted: 0.56,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 1995,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL3183409",
    name: "APALUTAMIDE",
    target_protein: "AR",
    target_chembl_id: "CHEMBL1871",
    target_full_name: "Androgen receptor",

    assay_chembl_id: "CHEMBL3592212",
    assay_description: "Antagonist activity at androgen receptor (unknown origin)",
    assay_type: "B",
    document_journal: "Eur J Med Chem",
    document_year: 2015,

    standard_value: 34.7,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 7.46,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CNC(=O)c1ccc(N2C(=S)N(c3cnc(C#N)c(C(F)(F)F)c3)C(=O)C23CCC3)cc1F",
    inchi_key: "HJBWBFZLDZWPHF-UHFFFAOYSA-N",

    mol_weight: 477.44,
    alogp: 3.53,
    hba: 5,
    hbd: 1,
    psa: 89.33,
    qed_weighted: 0.54,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 2018,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL4297185",
    name: "DAROLUTAMIDE",
    target_protein: "AR",
    target_chembl_id: "CHEMBL1871",
    target_full_name: "Androgen receptor",

    assay_chembl_id: "CHEMBL4710579",
    assay_description: "Inhibition of androgen receptor (unknown origin)",
    assay_type: "B",
    document_journal: "Eur J Med Chem",
    document_year: 2020,

    standard_value: 11.0,
    standard_relation: "=",
    standard_units: "nM",
    pchembl_value: 7.96,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CC(O)c1cc(C(=O)N[C@@H](C)Cn2ccc(-c3ccc(C#N)c(Cl)c3)n2)n[nH]1",
    inchi_key: "BLIJXOOIHRSQRB-PXYINDEMSA-N",

    mol_weight: 398.85,
    alogp: 2.67,
    hba: 6,
    hbd: 3,
    psa: 119.62,
    qed_weighted: 0.59,
    num_ro5_violations: null,

    max_phase: 4,
    first_approval: 2019,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  },
  {
    chembl_id: "CHEMBL2180681",
    name: "None",
    target_protein: "AR",
    target_chembl_id: "CHEMBL1871",
    target_full_name: "Androgen receptor",

    assay_chembl_id: null,
    assay_description: null,
    assay_type: null,
    document_journal: null,
    document_year: null,

    standard_value: null,
    standard_relation: null,
    standard_units: "nM",
    pchembl_value: null,
    ligand_efficiency: { bei: null, le: null, lle: null, sei: null },

    smiles: "CCCN1Cc2c(c3cc(OC)c(OC)c(OC)c3c3cc(OC)c(OC)cc23)C(O)C1",
    inchi_key: "YQAXKYBPGHUTRM-UHFFFAOYSA-N",

    mol_weight: 441.52,
    alogp: 4.30,
    hba: 7,
    hbd: 1,
    psa: 69.62,
    qed_weighted: 0.55,
    num_ro5_violations: null,

    max_phase: null,
    first_approval: null,
    withdrawn_flag: false,

    source: "chembl",
    created_at: "2026-03-28T00:00:00Z"
  }
]

const Compound = require('../src/db/compound')

const seed = async () => {
  await connectDB()
  await Compound.insertMany(compounds)
  console.log('9 documents inserted')
  process.exit(0)
}

seed()