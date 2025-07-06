import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/api/chat/sendMail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { text: '✅ Your message has been emailed.', sender: 'bot' },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: '❌ Failed to send. Please try again.', sender: 'bot' },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 font-poppins">
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-gradient-to-tr from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform relative"
      >
        💬
        {messages.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
            {messages.length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="w-80 max-w-[90vw] h-[470px] sm:h-[500px] mt-3 bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-blue-300 backdrop-blur-md transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-lg font-semibold text-center p-3">
            👩‍💻 Live Support
          </div>

          {/* Messages */}
          <div className="flex-1 px-3 py-2 overflow-y-auto bg-blue-50 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white self-end ml-auto'
                    : 'bg-white text-gray-800 border border-blue-200 self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-2 border-t border-gray-200 bg-white">
            <input
              type="text"
              className="flex-1 border border-gray-300 px-3 py-2 rounded-l-lg text-sm focus:outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
