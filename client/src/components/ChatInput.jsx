// ChatInput.jsx — controlled text input for submitting natural-language queries.
// Handles only UI state (the current input value).  All API and conversation
// state logic lives in App.js.

import { useState } from 'react'

/**
 * ChatInput — renders a text field and Submit button.
 *
 * @description A controlled component: React owns the input value via useState.
 *   On submit, calls the onSubmit prop with the trimmed message then clears the
 *   input.  Disabled while the parent signals a pending API request (loading).
 * @calledBy App.js
 * @param {function} props.onSubmit  Called with the message string when the user submits
 * @param {boolean}  props.loading   When true, disables input and button to prevent
 *   double-submission while waiting for the API response
 * @returns {JSX.Element}
 */
function ChatInput({ onSubmit, loading }) {
  // value tracks what the user has typed; cleared after each successful submit
  const [value, setValue] = useState('')

  /**
   * handleSubmit — fires on form submit (Enter key or button click).
   *
   * @description Prevents the default browser form submission (which would
   *   reload the page), guards against empty input, calls onSubmit, then resets.
   * @calledBy form onSubmit event
   * @param {Event} e  The browser submit event
   * @returns {void}
   */
  function handleSubmit(e) {
    // Prevent the browser's default behavior of reloading the page on form submit
    e.preventDefault()

    const trimmed = value.trim()

    // Guard: do nothing if the input is blank or only whitespace
    if (!trimmed) return

    // Hand the message up to App.js, then clear the input for the next query
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Ask about compounds — e.g. Show me PPARG compounds"
        // Disable while a request is in flight to prevent double-submission
        disabled={loading}
      />
      <button type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Thinking…' : 'Submit'}
      </button>
    </form>
  )
}

export default ChatInput
