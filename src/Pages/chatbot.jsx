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

// Add user's message
const newMessages = [
...messages,
{ text: input, sender: 'user' },
];
setMessages(newMessages);

// Generate bot reply
const botReply = getBotReply(input);

setMessages((prev) => [...prev, { text: botReply, sender: 'bot' }]);
setInput('');

// Count user messages
const userMessagesCount = newMessages.filter(
(msg) => msg.sender === 'user'
).length;

// Send mail only if it's the 24th message
if (userMessagesCount % 24 === 0) {
try {
const res = await fetch('http://localhost:5000/api/chat/sendMail', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
message: `User has sent ${userMessagesCount} messages.`,
}),
});

if (res.ok) {
setMessages((prev) => [
...prev,
{
text: `📧 Automatic mail sent for ${userMessagesCount} messages!`,
sender: 'bot',
},
]);
} else {
throw new Error();
}
} catch (err) {
setMessages((prev) => [
...prev,
{
text: '❌ Failed to send mail. Please try again later.',
sender: 'bot',
},
]);
}
}
};

const getBotReply = (text) => {
const lower = text.toLowerCase();

if (lower.includes('not loading')) {
return '🔍 Please check your internet connection and try refreshing the page.';
}
if (lower.includes('data')) {
return '📊 The data source might be incorrect. Double-check your settings.';
}
if (lower.includes('slow')) {
return '🐢 The server might be busy. Please wait a moment and try again.';
}

return '🤖 I see. Could you tell me more about the issue?';
};

return (
<div className="fixed bottom-5 right-4 sm:right-6 z-50 font-poppins">
{/* Floating Button */}
<button
onClick={() => setOpen((prev) => !prev)}
className="bg-gradient-to-tr from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform relative"
>
💬
{messages.length > 0 && (
<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
{messages.filter((msg) => msg.sender === 'user').length}
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
