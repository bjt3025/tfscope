// This file exports the MCP tool definitions sent to the Anthropic API with every request.
// Claude reads these definitions to know which tools exist, when to use each one, and what parameters each tool requires.
// Input: tool name, tool description, table schema to Claude API before each call 

module.exports = [
  /* Tools 1-3 commented out — replaced by query_compounds (Tool 4) which handles
     all the same cases plus range queries, multi-field filters, and sorting.
     Keeping the code here for reference; handlers and query functions remain intact.

  {
    // Tool 1: search all compounds for a given target protein, no potency filter.
    name: "search_by_target",
    description: "Search the compound database for all molecules targeting a specific protein. Use when the user asks about compounds for PPARG or AR without specifying a potency threshold.",
    input_schema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["PPARG", "AR"],
          description: "The target protein to search for"
        }
      },
      required: ["target"]
    }
  },
  {
    // Tool 2: filter compounds by target AND minimum potency.
    name: "filter_by_affinity",
    description: "Return compounds for a target protein filtered by minimum potency. pchembl_value is -log10(IC50) — higher values mean more potent. Use when the user specifies a potency threshold or asks for potent or strong compounds.",
    input_schema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["PPARG", "AR"]
        },
        min_pchembl: {
          type: "number",
          description: "Minimum pchembl_value threshold. Typical range: 5.0 (weak) to 9.0 (very potent)"
        }
      },
      required: ["target", "min_pchembl"]
    }
  },
/*
Example of what Claudes output would look like for filter_by_affinity
  {
  target: "PPARG",
  min_pchembl: 7.0
}
*/
/*
  {
    // Tool 3: look up a single compound by its ChEMBL ID.
    name: "get_compound_details",
    description: "Return full details for a single compound by its ChEMBL ID. Use when the user asks about a specific named compound or requests more detail on one result.",
    input_schema: {
      type: "object",
      properties: {
        chembl_id: {
          type: "string",
          description: "The ChEMBL ID of the compound, e.g. CHEMBL121"
        }
      },
      required: ["chembl_id"]
    }
  },
*/

  {
    // Tool 4: dynamic multi-field compound query.
    // Replaces Tools 1-3 for complex questions. Claude builds a filter object with
    // any combination of fields — each accepts a direct value or a { min, max } range.
    // Prefer this tool for any question involving ranges, multiple conditions, or
    // fields not covered by the other tools.
    name: "query_compounds",
    description: "Query the compounds database with any combination of filters. Use for questions involving ranges (e.g. pChEMBL between 6 and 8), multiple conditions (e.g. approved AND non-withdrawn), molecular properties (mol_weight, alogp, hbd, hba), or sorting by any field. Prefer this tool over search_by_target or filter_by_affinity for complex queries.",
    input_schema: {
      type: "object",
      properties: {
        filters: {
          type: "object",
          description: "Filter criteria. String and boolean fields use direct equality. Numeric fields accept a range object with optional min and/or max.",
          properties: {
            target_protein: {
              type: "string",
              description: "Target protein name e.g. PPARG or AR"
            },
            pchembl_value: {
              type: "object",
              description: "Potency range — pChEMBL = -log10(IC50). Higher = more potent. e.g. { min: 7.0 } or { min: 6.0, max: 8.0 }"
            },
            mol_weight: {
              type: "object",
              description: "Molecular weight in Daltons e.g. { max: 500 } for Lipinski rule"
            },
            max_phase: {
              type: "object",
              description: "Highest clinical trial phase reached. 4 = approved. e.g. { min: 3 } for late-stage only"
            },
            withdrawn_flag: {
              type: "boolean",
              description: "true = withdrawn compounds only, false = exclude withdrawn compounds"
            },
            alogp: {
              type: "object",
              description: "Calculated lipophilicity. Drug-like range: 0–5. e.g. { min: 0, max: 5 }"
            },
            hbd: {
              type: "object",
              description: "Hydrogen bond donor count. Lipinski limit: max 5. e.g. { max: 5 }"
            },
            hba: {
              type: "object",
              description: "Hydrogen bond acceptor count. Lipinski limit: max 10. e.g. { max: 10 }"
            },
            chembl_id: {
              type: "string",
              description: "Exact ChEMBL ID to look up e.g. CHEMBL121"
            }
          }
        },
        sort_by: {
          type: "string",
          description: "Field name to sort results by e.g. pchembl_value, mol_weight, qed_weighted"
        },
        sort_order: {
          type: "string",
          enum: ["asc", "desc"],
          description: "asc = lowest first, desc = highest first"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return. Defaults to 20 if not specified."
        }
      },
      required: []
    }
  }
]
