'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, Loader2, MessageSquare, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message { _id: string; role: 'user' | 'assistant'; content: string; createdAt: string; }

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await chatApi.getHistory();
        setMessages(res.data.data.messages);
      } catch { } finally { setInitialLoad(false); }
    };
    loadHistory();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const tempId = Date.now().toString();
    setMessages((prev) => [...prev, { _id: tempId, role: 'user', content: userMsg, createdAt: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(userMsg);
      const aiMsg = res.data.data.message;
      setMessages((prev) => [...prev, { _id: aiMsg._id, role: 'assistant', content: aiMsg.content, createdAt: aiMsg.createdAt }]);
    } catch {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally { setLoading(false); }
  };

  const clearHistory = async () => {
    try {
      await chatApi.clearHistory();
      setMessages([]);
      toast.success('Chat history cleared');
    } catch { toast.error('Failed to clear history'); }
  };

  if (initialLoad) return <div className="flex justify-center items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="page-header">AI Career Mentor</h2>
          <p className="page-subtitle">Get personalized career advice from your AI mentor</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground gap-2 rounded-xl">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Chat area */}
      <Card className="glass-card border-0 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold">Your AI Career Mentor</p>
                <p className="text-sm text-muted-foreground mt-1">Ask me anything about your career path, skills to learn, or interview preparation!</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['How do I transition to ML?', 'What skills should I learn first?', 'Review my learning plan'].map((q) => (
                  <button key={q} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-100 transition-colors">{q}</button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-600 to-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'assistant' ? 'bg-card border border-border' : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border p-3 rounded-2xl flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Ask your AI mentor anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              className="h-11 rounded-xl"
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()} className="h-11 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
