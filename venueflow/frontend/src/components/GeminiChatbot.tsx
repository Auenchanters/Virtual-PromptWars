import React, { useState, useRef, useEffect } from 'react';
import { useGemini } from '../hooks/useGemini';

const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const { sendMessage, loading } = useGemini();
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen && toggleRef.current) {
      toggleRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    
    const reply = await sendMessage(userMsg);
    if (reply) {
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: Could not get a response.' }]);
    }
  };

  return (
    <>
      <button 
        ref={toggleRef}
        aria-label="Open Venue Assistant Chat"
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 z-40"
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" className="text-xl">💬</span>
      </button>

      {isOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-label="Venue Assistant"
          className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-xl border flex flex-col z-50 h-96"
        >
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Venue Assistant</h3>
            <button 
              aria-label="Close Venue Assistant Chat"
              className="text-white hover:text-gray-200 focus:ring-2 focus:ring-white rounded p-1"
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center text-sm">Ask me anything about the venue!</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded px-4 py-2 max-w-[80%] ${m.role === 'user' ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-gray-100 text-gray-800'} border`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div aria-live="polite" aria-label="Loading..." className="text-gray-500 italic text-sm">
                Assistant is typing...
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50 flex gap-2 rounded-b-lg">
            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <input 
              id="chat-input"
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="E.g., Where is Gate 4?"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
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
