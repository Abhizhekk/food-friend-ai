
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChefHat, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RecipeData } from '@/services/GeminiService';
import geminiService from '@/services/GeminiService';

interface ChatSupportProps {
  recipe: RecipeData;
}

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const ChatSupport: React.FC<ChatSupportProps> = ({ recipe }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hi there! I'm your cooking assistant for ${recipe.name}. You can ask me any questions about the recipe, cooking techniques, substitutions, or other culinary advice. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [recipe.name]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const element = scrollAreaRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Build context for the AI
      const recipeContext = `
        Recipe: ${recipe.name}
        Description: ${recipe.description}
        Ingredients: ${recipe.ingredients.join(', ')}
        Cooking Time: ${recipe.cookingTime}
        Servings: ${recipe.servings}
      `;
      
      // Get response from AI
      const response = await geminiService.getChatbotResponse(input, recipeContext);
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="flex flex-col h-[65vh] border rounded-lg overflow-hidden glass-card animate-fade-in">
      <div className="p-4 border-b glass flex items-center gap-3">
        <ChefHat className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-medium">Recipe Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask any cooking questions</p>
        </div>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-12'
                    : 'bg-muted mr-12'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.sender === 'bot' && (
                    <Bot className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <User className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted mr-12">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 shrink-0" />
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t glass flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about the recipe..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatSupport;
