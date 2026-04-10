// server.js — Entry point for the TFScope Express API.
// Boots the database connection, initializes the Anthropic client, registers the
// POST /query route that drives the MCP tool-use loop, and either listens on a local
// exports a serverless-http handler (Lambda / Phase 3 deployment).

// ---------------------------------------------------------------------------
// Bootstrap: environment variables must be loaded before any other require so
// that every module that reads process.env receives the correct values at import
// time.  dotenv reads .env from the project root and merges it into process.env.
// ---------------------------------------------------------------------------
require('dotenv').config()

const express     = require('express')     // HTTP framework — app = express() creates the server object
const cors        = require('cors')        // Middleware: adds CORS headers so the React dev server (port 3000) can call this API (port 3001)
const serverless  = require('serverless-http') // Wraps Express for AWS Lambda — Phase 3 deployment uses this with zero changes to server logic
const Anthropic   = require('@anthropic-ai/sdk') // Official Anthropic SDK — provides the client.messages.create() call

const connectDB   = require('./src/db/connection')   // Connects to MongoDB Atlas; calls process.exit(1) on failure
const tools       = require('./src/mcp/tools')        // Array of 4 MCP tool definitions sent to Claude with every request
const { searchByTarget, filterByAffinity, getCompoundDetails, queryCompoundsHandler } = require('./src/mcp/handlers') // Handler functions — one per tool

// ---------------------------------------------------------------------------
// Application setup
// ---------------------------------------------------------------------------
const app = express()

// Parse JSON request bodies — without this, req.body is always undefined
app.use(express.json())

// Allow cross-origin requests from any origin in development.
// In Phase 3 this should be tightened to the specific frontend domain.
app.use(cors())

// ---------------------------------------------------------------------------
// Database — connect to Atlas on startup.
// connectDB() logs the Atlas host on success and calls process.exit(1) on
// failure, so the server never starts in a broken state.
// ---------------------------------------------------------------------------
connectDB()

// ---------------------------------------------------------------------------
// Anthropic client — initialized once at module load, reused for every request.
// The SDK reads ANTHROPIC_API_KEY from the environment automatically; no need
// to pass it explicitly.
// ---------------------------------------------------------------------------
const anthropic = new Anthropic()

// ---------------------------------------------------------------------------
// dispatchTool(name, input) — routes a tool call from Claude to the correct
// handler function and returns the handler's result.
//
// @description Called inside the tool-use loop in POST /query whenever Claude
//   returns a tool_use block.  Maps tool names (strings) to handler functions.
// @calledBy POST /query tool-use loop
// @calls searchByTarget | filterByAffinity | getCompoundDetails in src/mcp/handlers.js
// @param {string} name   The tool name Claude chose — must match one of the
//   names defined in src/mcp/tools.js
// @param {object} input  The argument object Claude constructed for the tool
// @returns {Promise<object>} The handler's result object ({ compounds } or { compound })
// @errorHandling Returns { error: 'Unknown tool: <name>' } for unrecognised tool
//   names rather than throwing, so the tool-use loop can forward the error to
//   Claude as a tool_result and continue gracefully.
// ---------------------------------------------------------------------------
async function dispatchTool(name, input) {
  // Route to the matching handler.  The tool names here must exactly match the
  // `name` fields in src/mcp/tools.js — Claude uses those names when it fires a tool call.
  //if (name === 'search_by_target')     return searchByTarget(input)
  //if (name === 'filter_by_affinity')   return filterByAffinity(input)
  //if (name === 'get_compound_details') return getCompoundDetails(input)
  if (name === 'query_compounds')      return queryCompoundsHandler(input)

  // Unrecognised tool name — surface as a structured error rather than throwing
  return { error: `Unknown tool: ${name}` }
}

// ---------------------------------------------------------------------------
// POST /query — main endpoint.
// Accepts a natural-language question, runs it through the Anthropic tool-use
// loop, executes any tool calls against MongoDB, and returns Claude's final
// text response plus the compound data retrieved.
//
// @description The full MCP tool-use loop lives here.  Claude may call zero or
//   more tools before producing a final text response.  Each tool call is
//   executed against MongoDB; results are fed back to Claude as tool_result
//   messages.  The loop continues until Claude stops requesting tool calls.
// @calledBy React frontend (Phase 2)
// @calls anthropic.messages.create() for each turn of the loop
// @calls dispatchTool() for each tool_use block in Claude's response
// @param {object} req.body.message  The user's natural-language question
// @returns {object} { response: string, compounds: Array }
//   response  — Claude's final plain-text answer
//   compounds — the last set of compound documents returned by any tool call
//               (empty array if no tool was called)
// @errorHandling Catches all errors and returns { error: message } with
//   HTTP 500 so the frontend can display a graceful failure message.
// ---------------------------------------------------------------------------
app.post('/query', async (req, res) => {
  try {
    const { message, history } = req.body

    // Guard: reject requests with no message body
    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }
    
    //History is past user conversations
    // Default history to [] so curl requests without a history field still work.
    const priorHistory = history || [] 

    // Build the messages array by prepending prior turns before the current message.
    // This gives Claude full conversation context for follow-up questions.
    const messages = [
      ...priorHistory,
      { role: 'user', content: message }
    ]

    // compounds accumulates the data returned by tool calls so the frontend
    // can render CompoundCards alongside Claude's text response.
    let compounds = []

    // ---------------------------------------------------------------------------
    // Tool-use loop — runs until Claude returns stop_reason === 'end_turn',
    // meaning it is done calling tools and has produced its final text answer.
    // ---------------------------------------------------------------------------
    while (true) {
      // Call the Anthropic API with the current message history and tool definitions.
      const apiResponse = await anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        tools,       // The 3 MCP tool definitions from src/mcp/tools.js
        messages //User Message 
      })

      // If Claude has already collect database information, extract the text and break.
      // stop_reason === 'end_turn' means the final content block is a text response.
      if (apiResponse.stop_reason === 'end_turn') {
        // Find the text block in Claude's response content array
        const textBlock = apiResponse.content.find(block => block.type === 'text')
        const responseText = textBlock ? textBlock.text : ''

        // Return the final response and any compound data collected during the loop
        return res.json({ response: responseText, compounds })
      }
      
      //Otherwise, Claude wants to call a tool. Add Claude's full response to the message
      // history as an assistant turn, then process each tool_use block.
      messages.push({ role: 'assistant', content: apiResponse.content })

      // Collect tool results — there may be multiple tool calls in one turn
      const toolResults = []

      for (const block of apiResponse.content) {
        if (block.type !== 'tool_use') continue // skip text blocks in this pass

        // Execute the tool call against MongoDB via dispatchTool
        const result = await dispatchTool(block.name, block.input)

        // If the result contains a compounds array, store it so we can return
        // it alongside the text response at the end of the loop
        if (result.compounds) compounds = result.compounds


        // Claude reads this to generate its next response or final answer.
        toolResults.push({
          type:        'tool_result',
          tool_use_id: block.id,
          content:     JSON.stringify(result)
        })
      }

      // Add the tool results as a user turn so Claude can see them in the next query
      messages.push({ role: 'user', content: toolResults })
    }

  } catch (err) {
    // Unexpected error — log for debugging and return a structured error to the client
    console.error('POST /query error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Serverless export — used by AWS Lambda in Phase 3 deployment.
// When running locally, this export is ignored; app.listen() handles requests.
// ---------------------------------------------------------------------------
module.exports.handler = serverless(app)

// ---------------------------------------------------------------------------
// Local dev server — only start listening when running outside Lambda.
// In Lambda, AWS invokes module.exports.handler directly; there is no listen().
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`TFScope server running on port ${PORT}`)
  })
}
