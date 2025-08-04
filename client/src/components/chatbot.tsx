import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Bot, User, X, Send, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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
  isTyping?: boolean;
  displayedContent?: string;
}

export default function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your rag & bone shopping assistant. I can help you find the perfect modern fashion pieces, track orders, or answer any questions about our collections. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Smart auto-scroll state
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  // Typing effect for AI messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prevMessages => {
        let shouldScroll = false;
        const updatedMessages = prevMessages.map(message => {
          if (message.role === 'assistant' && message.isTyping && message.displayedContent !== undefined) {
            const fullContent = message.content;
            const currentDisplayed = message.displayedContent;

            if (currentDisplayed.length < fullContent.length) {
              // Add 1-3 characters at a time for more natural typing
              const charsToAdd = Math.min(
                Math.floor(Math.random() * 3) + 1,
                fullContent.length - currentDisplayed.length
              );

              shouldScroll = true; // Content is being added, should scroll

              return {
                ...message,
                displayedContent: fullContent.slice(0, currentDisplayed.length + charsToAdd)
              };
            } else {
              // Typing complete
              return {
                ...message,
                isTyping: false,
                displayedContent: fullContent
              };
            }
          }
          return message;
        });

        // Scroll to bottom during typing if user hasn't manually scrolled up
        if (shouldScroll && !userHasScrolled) {
          setTimeout(() => {
            isScrollingProgrammatically.current = true;
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => {
              isScrollingProgrammatically.current = false;
            }, 100);
          }, 10);
        }

        return updatedMessages;
      });
    }, 30); // Adjust speed here (lower = faster)

    return () => clearInterval(interval);
  }, [messages, userHasScrolled]);

  // Check if user has manually scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Don't treat programmatic scrolling as user scrolling
    if (isScrollingProgrammatically.current) {
      return;
    }

    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    // Only set userHasScrolled to true if they're clearly not at the bottom
    if (!isAtBottom) {
      setUserHasScrolled(true);
    } else {
      setUserHasScrolled(false);
    }
  };

  const scrollToBottom = () => {
    isScrollingProgrammatically.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Reset the flag after scroll completes
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 500);
  };

  // Only auto-scroll when there's a new message and user hasn't manually scrolled up
  useEffect(() => {
    const currentMessageCount = messages.length;

    // New message added
    if (currentMessageCount > lastMessageCount) {
      // Only auto-scroll if user hasn't manually scrolled up
      if (!userHasScrolled) {
        scrollToBottom();
      }
      setLastMessageCount(currentMessageCount);
    }
  }, [messages, userHasScrolled, lastMessageCount]);

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
        quickActions: data.quickActions || [],
        isTyping: true,
        displayedContent: ""
      };

      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date(),
        isTyping: true,
        displayedContent: ""
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, size, color }: { productId: string; size: string; color: string }) => {
      const response = await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        size,
        color
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart!",
        description: "Item has been added to your cart successfully.",
      });

      const successMessage: ChatMessage = {
        role: "assistant",
        content: "Great! I've added that item to your cart. Would you like to continue shopping or proceed to checkout with Cash on Delivery?",
        timestamp: new Date(),
        quickActions: ["Proceed with COD", "Continue Shopping", "View Cart"],
        isTyping: true,
        displayedContent: ""
      };
      setMessages(prev => [...prev, successMessage]);
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/checkout", {});
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      const successMessage: ChatMessage = {
        role: "assistant",
        content: data.message || "Your order has been placed successfully with Cash on Delivery!",
        timestamp: new Date(),
        quickActions: ["Track my order", "Continue Shopping"],
        isTyping: true,
        displayedContent: ""
      };
      setMessages(prev => [...prev, successMessage]);
    },
    onError: async (error) => {
      console.error("Checkout error:", error);
      let errorContent = "I'm sorry, there was an issue processing your checkout. Please try again or contact support.";

      // Try to get more specific error information
      if (error.message.includes("Cart is empty")) {
        errorContent = "It looks like your cart is empty. Please add some items to your cart first, then I can help you checkout with Cash on Delivery.";
      }

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
        quickActions: ["Continue Shopping", "View Cart"],
        isTyping: true,
        displayedContent: ""
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
    if (chatMutation.isPending || checkoutMutation.isPending || addToCartMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Handle special checkout actions
    if (action === "Proceed with COD" || action === "Yes, checkout with COD") {
      checkoutMutation.mutate();
    } else {
      chatMutation.mutate(action);
    }
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
          <div
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 chatbot-scroll"
            onScroll={handleScroll}
          >
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
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:text-sm prose-p:text-sm prose-li:text-sm prose-strong:text-sm">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4 list-disc">{children}</ul>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                      >
                        {message.displayedContent !== undefined ? message.displayedContent : message.content}
                      </ReactMarkdown>
                      {message.isTyping && (
                        <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1">|</span>
                      )}
                    </div>
                  )}
                  
                  {/* Show recommendations if available and typing is complete */}
                  {message.recommendations && message.recommendations.length > 0 && !message.isTyping && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium">Recommended products:</p>
                      {message.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg transition-colors">
                          <div className="flex space-x-2 mb-2">
                            {rec.product?.image && (
                              <img
                                src={rec.product.image}
                                alt={rec.product.name}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = `https://via.placeholder.com/400x600/6366f1/ffffff?text=${encodeURIComponent(rec.product?.name?.split(' ')[0] || 'Product')}`;
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{rec.product?.name}</p>
                              <p className="text-xs text-success font-semibold">${rec.product?.price}</p>
                              <p className="text-xs text-neutral mt-1">{rec.reason}</p>
                            </div>
                          </div>
                          {rec.product && (
                            <Button
                              size="sm"
                              className="w-full text-xs h-6"
                              onClick={() => addToCartMutation.mutate({
                                productId: rec.productId,
                                size: rec.product.sizes?.[0] || "M",
                                color: rec.product.colors?.[0] || "Default"
                              })}
                              disabled={addToCartMutation.isPending}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show quick actions if available and typing is complete */}
                  {message.quickActions && message.quickActions.length > 0 && !message.isTyping && (
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
            
            {/* Scroll to bottom button */}
            {userHasScrolled && (
              <div className="sticky bottom-2 flex justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full shadow-lg text-xs px-3 py-1 h-7"
                  onClick={() => {
                    setUserHasScrolled(false);
                    scrollToBottom();
                  }}
                >
                  ↓ New messages
                </Button>
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
