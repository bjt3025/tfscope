// api.js — HTTP client for the TFScope Express API.
// All network calls from the React frontend go through this module so that
// request shape and error handling are defined in one place.

/**
 * postQuery — sends a natural-language message and conversation history to the
 * Express POST /query endpoint and returns the parsed JSON response.
 *
 * @description The proxy field in client/package.json forwards this request to
 *   http://localhost:3001/query, so we only need the path, not the full URL.
 *   history is the Anthropic-format array of prior turns: each entry is
 *   { role: "user" | "assistant", content: string }.  On the first message
 *   history is an empty array [].
 * @calledBy App.js handleSubmit
 * @param {string} message    The user's current natural-language question
 * @param {Array}  history    Prior conversation turns in Anthropic format
 * @returns {Promise<{ response: string, compounds: Array }>}
 *   response  — Claude's plain-text answer
 *   compounds — array of compound documents returned by any tool call
 * @errorHandling Throws if the network request fails or the server returns a
 *   non-OK status.  The caller (App.js) catches this and displays an error message.
 */
async function postQuery(message, history = []) {
  const res = await fetch('/query', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    // Send both the current message and the full prior history so the server
    // can pass them together to the Anthropic API
    body: JSON.stringify({ message, history }),
  })

  // Surface HTTP errors (4xx, 5xx) as thrown errors so the caller can catch them
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }

  return res.json()
}

export { postQuery }
