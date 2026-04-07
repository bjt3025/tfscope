// MessageList.jsx — renders the conversation history as a list of chat bubbles.
// Receives the messages array from App.js and maps each entry to a styled block.

import CompoundCard from './CompoundCard'

/**
 * MessageList — displays all conversation turns in order.
 *
 * @description Maps over the messages array and renders each as a div with a
 *   role-based CSS class (message--user or message--assistant).  For assistant
 *   messages that include compound data, renders a CompoundCard below the text
 *   for each compound.
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

          {/* Render one CompoundCard per compound returned by the tool call.
              compounds is [] for user messages and assistant messages with no tool results */}
          {msg.compounds && msg.compounds.length > 0 && (
            <div className="compound-card-list">
              {msg.compounds.map(compound => (
                <CompoundCard key={compound.chembl_id} compound={compound} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MessageList
