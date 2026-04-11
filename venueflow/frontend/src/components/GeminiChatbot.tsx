import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { MAX_MESSAGE_LENGTH } from '../utils/constants';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const { sendMessage, loading } = useGemini();
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeChat = useCallback(() => setIsOpen(false), []);

  useFocusTrap(dialogRef, isOpen, closeChat);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else toggleRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');

    const reply = await sendMessage(trimmed);
    if (reply) {
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Error: Could not get a response.' },
      ]);
    }
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Open Venue Assistant Chat"
        aria-expanded={isOpen}
        aria-controls="venue-chatbot-dialog"
        className="fixed bottom-4 right-4 bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 z-40"
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" className="text-xl">💬</span>
      </button>

      {isOpen && (
        <div
          id="venue-chatbot-dialog"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="venue-chatbot-title"
          className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-xl border flex flex-col z-50 h-96"
        >
          <div className="bg-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 id="venue-chatbot-title" className="font-bold">Venue Assistant</h3>
            <button
              type="button"
              aria-label="Close Venue Assistant Chat"
              className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
              onClick={closeChat}
            >
              <span aria-hidden="true">✖</span>
            </button>
          </div>

          <div
            className="flex-grow overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 && (
              <p className="text-gray-500 text-center text-sm">Ask me anything about the venue!</p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : 'bg-gray-100 text-gray-800'
                  } border`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div aria-label="Loading..." className="text-gray-500 italic text-sm">
                Assistant is typing...
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 border-t bg-gray-50 flex gap-2 rounded-b-lg"
          >
            <label htmlFor="chat-input" className="sr-only">
              Type your message to the venue assistant
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-grow border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Where is Gate 4?"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
