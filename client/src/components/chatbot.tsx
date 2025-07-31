import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Bot, User, X, Send } from "lucide-react";

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendations?: any[];
  quickActions?: string[];
}

export default function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your DL1961 shopping assistant. I can help you find the perfect jeans, track orders, or answer any questions. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        const response = await apiRequest("POST", "/api/chat", {
          message,
          conversationId
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Chat API error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        recommendations: data.recommendations || [],
        quickActions: data.quickActions || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    if (chatMutation.isPending) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: action,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(action);
  };

  const quickActions = [
    "Find jeans for women",
    "Track my order",
    "Size guide help",
    "Sustainability info"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full w-16 h-16 bg-accent hover:bg-accent/90 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-[520px] flex flex-col shadow-2xl animate-fade-in border-0">
        <CardHeader className="bg-primary text-white p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">DL1961 Assistant</h4>
              <p className="text-xs text-gray-300">Always here to help</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 chatbot-scroll">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                
                <div className={`max-w-xs ${
                  message.role === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary'
                } rounded-lg p-3`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show recommendations if available */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium">Recommended products:</p>
                      {message.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="flex space-x-2 p-2 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                             onClick={() => rec.productId && handleQuickAction(`Show me ${rec.product?.name}`)}>
                          {rec.product?.image && (
                            <img 
                              src={rec.product.image} 
                              alt={rec.product.name}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{rec.product?.name}</p>
                            <p className="text-xs text-success font-semibold">${rec.product?.price}</p>
                            <p className="text-xs text-neutral mt-1">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show quick actions if available */}
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.quickActions.slice(0, 2).map((action, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => handleQuickAction(action)}
                          disabled={chatMutation.isPending}
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-6 h-6 bg-neutral/20 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                    <User className="h-3 w-3 text-neutral" />
                  </div>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Actions */}
          {messages.length <= 1 && !chatMutation.isPending && (
            <div className="p-3 border-t border-border flex-shrink-0">
              <p className="text-xs text-neutral mb-2">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-2"
                    onClick={() => handleQuickAction(action)}
                    disabled={chatMutation.isPending}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={chatMutation.isPending}
                className="flex-1 text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="bg-accent hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
