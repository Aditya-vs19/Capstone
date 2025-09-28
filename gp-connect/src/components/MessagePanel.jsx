import React, { useState } from 'react';
import './MessagePanel.css';

const messages = [
  { name: 'Suru 🌸', preview: 'Hey, did you see my last post?', chat: [
    { from: 'them', text: 'Hey, did you see my last post?' },
    { from: 'me', text: 'Yeah, it was awesome!' },
  ] },
  { name: 'Vishu ⚡', preview: 'Let’s meet tomorrow!', chat: [
    { from: 'them', text: 'Let’s meet tomorrow!' },
    { from: 'me', text: 'Sure, what time?' },
  ] },
  { name: 'Hotspot ', preview: 'Maddarchod salya , parat chedl tr FIR krel , FUCK OFF!!!1.', chat: [
    { from: 'them', text: 'Maddarchod salya , parat chedl tr FIR krel , FUCK OFF!!!1.' },
  ] },
  { name: 'Vedu 🌸', preview: 'Hey, did you see my last post?', chat: [
    { from: 'them', text: 'Hey, did you see my last post?' },
  ] },
  { name: 'Punde yz⚡', preview: 'Let’s meet tomorrow!', chat: [
    { from: 'them', text: 'Let’s meet tomorrow!' },
  ] },
  // more dummy messages...
];

const MessagePanel = () => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selected = selectedIdx !== null ? messages[selectedIdx] : null;

  // Mobile: list view or chat view
  if (isMobile) {
    if (selectedIdx === null) {
      // List view only
      return (
        <div className="dm-container mobile">
          <div className="dm-list mobile">
            <h4 className="dm-title">Messages</h4>
            {messages.map((msg, i) => (
              <div
                className={`msg-item${i === selectedIdx ? ' selected' : ''}`}
                key={i}
                onClick={() => setSelectedIdx(i)}
              >
                <div className="msg-avatar">{msg.name.charAt(0)}</div>
                <div className="msg-content">
                  <p className="msg-name">{msg.name}</p>
                  <p className="msg-preview">{msg.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Chat view only
      return (
        <div className="dm-container mobile chat-view">
          <div className="dm-chat mobile">
            <div className="dm-chat-header mobile">
              <button className="dm-back-btn" onClick={() => setSelectedIdx(null)}>&larr;</button>
              {selected.name}
            </div>
            <div className="dm-chat-body">
              {selected.chat.map((msg, idx) => (
                <div key={idx} className={`dm-bubble ${msg.from === 'me' ? 'me' : 'them'}`}>{msg.text}</div>
              ))}
            </div>
            <div className="dm-chat-input-row">
              <input className="dm-chat-input" placeholder="Type a message..." disabled />
              <button className="dm-send-btn" disabled>Send</button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Desktop: two-pane layout
  return (
    <div className="dm-container">
      {/* Left: Message List */}
      <div className="dm-list">
        <h4 className="dm-title">Messages</h4>
        {messages.map((msg, i) => (
          <div
            className={`msg-item${i === selectedIdx ? ' selected' : ''}`}
            key={i}
            onClick={() => setSelectedIdx(i)}
          >
            <div className="msg-avatar">{msg.name.charAt(0)}</div>
            <div className="msg-content">
              <p className="msg-name">{msg.name}</p>
              <p className="msg-preview">{msg.preview}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Right: Chat Window */}
      <div className="dm-chat">
        {selected ? (
          <>
            <div className="dm-chat-header">{selected.name}</div>
            <div className="dm-chat-body">
              {selected.chat.map((msg, idx) => (
                <div key={idx} className={`dm-bubble ${msg.from === 'me' ? 'me' : 'them'}`}>{msg.text}</div>
              ))}
            </div>
            <div className="dm-chat-input-row">
              <input className="dm-chat-input" placeholder="Type a message..." disabled />
              <button className="dm-send-btn" disabled>Send</button>
            </div>
          </>
        ) : (
          <div className="dm-chat-placeholder">Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default MessagePanel;
