// This file exports the MCP tool definitions sent to the Anthropic API with every request.
// Claude reads these definitions to know which tools exist, when to use each one, and what parameters each tool requires.

module.exports = [
  {
    // Tool 1: search all compounds for a given target protein, no potency filter.
    // Claude uses this when the user asks a broad question like "show me PPARG compounds"
    // without specifying a minimum potency threshold.
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
    // pchembl_value is -log10(IC50) — a value of 7 means IC50 = 100nM, 8 means 10nM, 9 means 1nM.
    // Higher = more potent. Claude uses this when the user mentions potency, threshold, or "strong/potent".
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
  {
    // Tool 3: look up a single compound by its ChEMBL ID.
    // Claude uses this when the user names a specific compound or asks for more detail
    // on one result — e.g. "tell me about Rosiglitazone" or "what is CHEMBL121?".
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
  }
]
