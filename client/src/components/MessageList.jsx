// MessageList.jsx — renders the conversation history as a list of chat bubbles.
// Receives the messages array from App.js and maps each entry to a styled block.
// CompoundCard rendering is wired in during Step 8D.

/**
 * MessageList — displays all conversation turns in order.
 *
 * @description Maps over the messages array and renders each as a div with a
 *   role-based CSS class (message--user or message--assistant) so they can be
 *   styled differently.  The text field is rendered as preformatted text to
 *   preserve Claude's markdown-style line breaks until a markdown renderer is
 *   added in the styling pass.
 * @calledBy App.js
 * @param {Array} props.messages  Array of { role, text, compounds } objects
 * @returns {JSX.Element}
 */
function MessageList({ messages }) {
  // Nothing to render until the first message arrives
  if (!messages.length) return null

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        // index is a safe key here because messages are append-only — they are
        // never reordered or removed during a session
        <div key={index} className={`message message--${msg.role}`}>
          {/* Role label so the user can distinguish their input from Claude's response */}
          <span className="message__role">
            {msg.role === 'user' ? 'You' : 'TFScope'}
          </span>

          {/* Claude's responses may contain newlines — white-space: pre-wrap
              preserves them without requiring a full markdown renderer yet */}
          <p className="message__text">{msg.text}</p>

          {/* CompoundCard list is rendered here in Step 8D */}
        </div>
      ))}
    </div>
  )
}

export default MessageList
