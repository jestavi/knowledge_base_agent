import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {isUser ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col relative group ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`
              relative px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-xl backdrop-blur-sm
              ${isUser 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'glass-panel text-slate-200 rounded-tl-none border-white/10'
              }
            `}
          >
            {/* Markdown Rendering */}
            <div className="markdown-content">
              {isUser ? (
                <p>{message.text}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    // Custom renderer for code blocks to support basic visual separation
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <div className="my-4 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                          <div className="bg-slate-900 px-3 py-1 text-xs text-slate-400 font-mono border-b border-slate-800 flex justify-between items-center">
                            <span>{match[1]}</span>
                            {match[1] === 'mermaid' && <span className="text-emerald-400">Diagram Code</span>}
                          </div>
                          <pre className="p-4 overflow-x-auto text-slate-300 text-xs font-mono">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-slate-700/50 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      )
                    },
                    ul: ({children}) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
                    h3: ({children}) => <h3 className="text-lg font-semibold my-2 text-indigo-300">{children}</h3>,
                    h4: ({children}) => <h4 className="text-md font-semibold my-1 text-white">{children}</h4>,
                    strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                    a: ({href, children}) => <a href={href} className="text-indigo-400 underline hover:text-indigo-300" target="_blank" rel="noreferrer">{children}</a>
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              )}
            </div>

            {/* Actions for Bot Messages */}
            {!isUser && (
              <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1 rounded-full border border-white/5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <span className="text-[10px] text-slate-500 mt-2 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
