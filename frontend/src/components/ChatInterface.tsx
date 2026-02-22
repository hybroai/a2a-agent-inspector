"use client"

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Copy, Check, Code, Info, ChevronDown, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { sendMessage } from "@/lib/api/api";

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  rawContent?: Record<string, unknown>;
  timestamp: Date;
  error?: boolean;
  isFormatted?: boolean;
  responseTime?: number;
}

interface ChatInterfaceProps {
  agentUrl?: string;
  title?: string;
  agentName?: string;
}

function ChatInterface({ agentUrl, title = "Agent Chat", agentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [infoBannerOpen, setInfoBannerOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  const addMessage = (type: Message['type'], content: string, error = false, rawContent?: Record<string, unknown>, responseTime?: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      rawContent,
      timestamp: new Date(),
      error,
      isFormatted: true,
      responseTime
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const toggleFormat = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.type === 'agent' && msg.rawContent) {
        const newIsFormatted = !msg.isFormatted;
        return {
          ...msg,
          isFormatted: newIsFormatted,
          content: newIsFormatted 
            ? JSON.stringify(msg.rawContent, null, 2)
            : JSON.stringify(msg.rawContent)
        };
      }
      return msg;
    }));
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!agentUrl) {
      toast.error("No agent URL provided");
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    const startTime = Date.now();

    addMessage('user', userMessage);

    try {
      const response = await sendMessage(agentUrl, userMessage);
      const responseTime = Date.now() - startTime;
      
      if (response.success) {
        const agentResponse = response.data;
        addMessage('agent', JSON.stringify(agentResponse, null, 2), false, agentResponse, responseTime);
      } else {
        const errorMsg = response.error || "Failed to send message";
        addMessage('system', `Error: ${errorMsg}`, true);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage('system', `Error: Failed to send message`, true);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>
                {agentUrl 
                  ? agentName 
                    ? `Testing ${agentName}` 
                    : `Connected to: ${agentUrl}`
                  : "No agent connected"
                }
              </CardDescription>
            </div>
            
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                title="Clear chat"
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Collapsible Info banner */}
          <Collapsible open={infoBannerOpen} onOpenChange={setInfoBannerOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 mt-3 p-3 rounded-md bg-muted/50 border border-border text-sm text-muted-foreground w-full text-left hover:bg-muted/70 transition-colors">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">
                  {infoBannerOpen 
                    ? "This chat outputs raw JSON responses for inspection purposes."
                    : "Raw JSON output mode"
                  }
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${infoBannerOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="text-xs text-muted-foreground mt-2 pl-9">
                Use the format button to toggle between formatted and minified JSON. 
                This is useful for debugging and understanding the A2A protocol responses.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 relative">
          <ScrollArea 
            className="flex-1 p-4 pr-2" 
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-medium">Ready to test</p>
                  <p className="text-sm mt-1">
                    {agentUrl 
                      ? "Send a message to start testing the agent" 
                      : "Load an agent first to start testing"
                    }
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-secondary text-secondary-foreground'
                          : message.type === 'agent'
                          ? 'bg-muted text-foreground border border-border'
                          : message.error
                          ? 'bg-destructive/10 text-destructive border border-destructive/20'
                          : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : message.type === 'agent' ? (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          {message.type === 'agent' ? (
                            <pre className="text-sm whitespace-pre-wrap break-words font-mono overflow-x-auto">
                              {message.content}
                            </pre>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                            <div className="flex items-center gap-2 text-xs opacity-70">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.responseTime && (
                                <span className="text-green-600 dark:text-green-400">
                                  • {formatResponseTime(message.responseTime)}
                                </span>
                              )}
                            </div>
                            {message.type === 'agent' && message.rawContent && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => toggleFormat(message.id)}
                                  title={message.isFormatted ? "Minify JSON" : "Format JSON"}
                                >
                                  <Code className="h-3 w-3 mr-1" />
                                  {message.isFormatted ? "Minify" : "Format"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  title="Copy to clipboard"
                                >
                                  {copiedId === message.id ? (
                                    <Check className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Copy className="h-3 w-3 mr-1" />
                                  )}
                                  {copiedId === message.id ? "Copied" : "Copy"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg px-4 py-3 border border-border">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Agent is responding...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-20 right-4 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
          
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={agentUrl ? "Type your message..." : "Load an agent first..."}
                disabled={!agentUrl || isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!agentUrl || !inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatInterface;
