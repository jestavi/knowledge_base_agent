import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, Sparkles, MessageSquare, Plus } from 'lucide-react';
import DocumentSidebar from './components/DocumentSidebar';
import MessageBubble from './components/MessageBubble';
import { DocumentFile, Message, MessageRole } from './types';
import { generateId } from './utils/fileUtils';
import { generateResponseStream } from './services/geminiService';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      text: "Hello! I'm InsightDoc. Upload your company documents (Policies, SOPs, Reports) to the left, and I'll help you find answers, summarize content, or compare topics.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: MessageRole.USER,
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for bot response
    const botMsgId = generateId();
    const botMsg: Message = {
      id: botMsgId,
      role: MessageRole.MODEL,
      text: '', // Starts empty
      timestamp: Date.now(),
      isStreaming: true
    };
    setMessages(prev => [...prev, botMsg]);

    try {
      await generateResponseStream(
        [...messages, userMsg], // Full history
        documents,
        userMsg.text,
        (chunkText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: chunkText } 
              : msg
          ));
        }
      );
    } catch (error) {
      console.error("Error generating response", error);
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestions
  const suggestions = [
    "Summarize the Leave Policy",
    "Compare 2024 vs 2025 Roadmap",
    "What are the emergency protocols?",
    "List key risks in the Q3 Report"
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Mobile Sidebar Toggle Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Documents */}
      <div 
        className={`
          fixed md:relative z-30 h-full w-[280px] md:w-[320px] transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}
        `}
      >
        <DocumentSidebar documents={documents} setDocuments={setDocuments} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-lg tracking-tight">InsightDoc AI</h2>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setMessages([messages[0]])} // Reset chat
              className="p-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && messages[messages.length - 1].text === '' && (
              <div className="flex justify-start w-full mb-6 pl-14">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Quick Suggestions (Only show if chat is empty-ish) */}
            {messages.length < 3 && documents.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 text-xs text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-end bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={documents.length === 0 ? "Please upload a document first..." : "Ask a question about your documents..."}
                  disabled={documents.length === 0 || isLoading}
                  className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-4 py-4 min-h-[60px] max-h-[200px] outline-none resize-none disabled:opacity-50"
                  rows={1}
                  style={{ height: 'auto', minHeight: '60px' }}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || documents.length === 0}
                  className={`
                    m-2 p-3 rounded-xl flex items-center justify-center transition-all duration-300
                    ${!input.trim() || isLoading 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25'
                    }
                  `}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-600">
              InsightDoc AI can make mistakes. Verify important information from source documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
