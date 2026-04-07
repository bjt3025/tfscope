// App.js — root component for TFScope.
// Owns all conversation state and coordinates the API call.
// CompoundCard is wired into MessageList during Step 8D.

import { useState } from 'react'
import './App.css'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import { postQuery } from './services/api'

/**
 * App — root component and state owner for TFScope.
 *
 * @description Holds two parallel state arrays:
 *   messages — display array for the chat UI: { role, text, compounds }
 *   history  — Anthropic context array sent to the API: { role, content }
 *   Compound data is added to messages only — never to history — because raw
 *   JSON documents add noise to Claude's context without improving its answers.
 * @returns {JSX.Element}
 */
function App() {
  // messages drives the chat UI — includes compound data for rendering cards
  const [messages, setMessages] = useState([])

  // history is the Anthropic-format array sent with every API request so
  // Claude can answer follow-up questions with full conversation context
  const [history, setHistory] = useState([])

  // loading prevents double-submission and drives the ChatInput disabled state
  const [loading, setLoading] = useState(false)

  /**
   * handleSubmit — called by ChatInput when the user submits a message.
   *
   * @description Adds the user turn to both state arrays, calls the API with
   *   the current history, then adds the assistant response to both arrays
   *   (compounds go to messages only).  Runs inside a try/catch so errors are
   *   surfaced as an assistant message rather than crashing the app.
   * @calledBy ChatInput onSubmit prop
   * @calls postQuery in services/api.js
   * @param {string} message  The user's natural-language question
   * @returns {Promise<void>}
   */
  async function handleSubmit(message) {
    // Add the user message to both arrays immediately so the UI feels responsive
    setMessages(prev => [...prev, { role: 'user', text: message, compounds: [] }])
    setHistory(prev => [...prev, { role: 'user', content: message }])
    setLoading(true)

    try {
      // Pass the current history (before this turn) so Claude has full context.
      // The server appends the new user message to history before calling Anthropic.
      const data = await postQuery(message, history)

      // Log full response for 8B.4 verification before MessageList is built
      console.log('API response:', data)

      // Add assistant response to display array (with compounds) and history (text only)
      setMessages(prev => [...prev, {
        role:      'assistant',
        text:      data.response,
        compounds: data.compounds || []
      }])
      setHistory(prev => [...prev, { role: 'assistant', content: data.response }])

    } catch (err) {
      // Surface errors as an assistant message so the UI doesn't go silent
      console.error('Query error:', err.message)
      setMessages(prev => [...prev, {
        role:      'assistant',
        text:      `Error: ${err.message}`,
        compounds: []
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>TFScope</h1>
      <MessageList messages={messages} />
      {/* Loading indicator shown while waiting for the API response */}
      {loading && <p className="loading">Thinking…</p>}
      <ChatInput onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}

export default App
