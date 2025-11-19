import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Clock, Wrench, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { chatService, formatTime, renderToolCall } from '@/lib/chat';
import type { ChatState } from '../../../worker/types';
import { ScrollArea } from '@/components/ui/scroll-area';
const SUGGESTED_PROMPTS = [
  "Optimize my route",
  "Check compliance status",
  "List e-waste items",
  "Generate operations report"
];
const AssistantApp = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.streamingMessage]);
  const handleSubmit = async (e: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const message = (customPrompt || input).trim();
    if (!message || chatState.isProcessing) return;
    setInput('');
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: '',
      isProcessing: true,
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
    setChatState(prev => ({ ...prev, isProcessing: false, streamingMessage: '' }));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-4">
          {chatState.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  <span className="text-xs opacity-70"><Clock className="w-3 h-3 inline mr-1" />{formatTime(msg.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap mb-2">{msg.content}</p>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    <div className="flex items-center gap-1 mb-2 text-xs opacity-70"><Wrench className="w-3 h-3" />Tools used:</div>
                    {msg.toolCalls.map((tool, idx) => (
                      <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs">{renderToolCall(tool)}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {chatState.streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-2xl max-w-[80%]">
                <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4" /><span className="text-xs opacity-70">Now</span></div>
                <p className="whitespace-pre-wrap">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
              </div>
            </div>
          )}
          {chatState.isProcessing && !chatState.streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-2xl">
                <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4" /><span className="text-xs opacity-70">Thinking...</span></div>
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button 
                key={prompt} 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1 text-xs rounded-full"
                onClick={(e) => handleSubmit(e, prompt)}
                disabled={chatState.isProcessing}
              >
                <Sparkles size={12} className="text-primary" />
                {prompt}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the assistant..."
              className="flex-1 min-h-[42px] max-h-32 resize-none"
              rows={1}
              disabled={chatState.isProcessing}
            />
            <Button type="submit" disabled={!input.trim() || chatState.isProcessing}><Send className="w-4 h-4" /></Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">AI interactions are subject to usage limits across all users.</p>
        </div>
      </div>
    </div>
  );
};
export default AssistantApp;