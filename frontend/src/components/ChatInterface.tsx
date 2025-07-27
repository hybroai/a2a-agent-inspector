"use client"

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { sendMessage } from "@/lib/api/api";

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatInterfaceProps {
  agentUrl?: string;
  title?: string;
}

function ChatInterface({ agentUrl, title = "Agent Chat" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const addMessage = (type: Message['type'], content: string, error = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      error
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
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

    addMessage('user', userMessage);

    try {
      const response = await sendMessage(agentUrl, userMessage);
      
      if (response.success) {
        const agentResponse = response.response || response.message || "Message sent successfully";
        addMessage('agent', agentResponse);
        toast.success("Message sent successfully");
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

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>
                {agentUrl ? `Connected to: ${agentUrl}` : "No agent connected"}
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
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start a conversation!</p>
                  {!agentUrl && (
                    <p className="text-sm mt-2">Please load an agent first.</p>
                  )}
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
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.type === 'agent'
                          ? 'bg-gray-100 text-gray-900'
                          : message.error
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : message.type === 'agent' ? (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : null}
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
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
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
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