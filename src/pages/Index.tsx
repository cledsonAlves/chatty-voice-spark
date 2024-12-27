import { useState, useRef, useEffect } from "react";
import { Send, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import LoadingDots from "@/components/LoadingDots";
import { textToSpeech } from "@/services/textToSpeech";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const getBotResponse = (userMessage: string): string => {
  const normalizedMessage = userMessage.toLowerCase();
  
  if (normalizedMessage.includes('olá') || normalizedMessage.includes('oi')) {
    return 'Olá! Como posso ajudar você hoje?';
  }
  
  if (normalizedMessage.includes('como vai') || normalizedMessage.includes('tudo bem')) {
    return 'Estou muito bem, obrigado por perguntar! E você, como está?';
  }
  
  if (normalizedMessage.includes('tchau') || normalizedMessage.includes('até logo')) {
    return 'Até logo! Foi um prazer conversar com você!';
  }
  
  if (normalizedMessage.includes('obrigado') || normalizedMessage.includes('obrigada')) {
    return 'Por nada! Estou sempre à disposição para ajudar!';
  }
  
  if (normalizedMessage.includes('quem é você')) {
    return 'Sou um assistente virtual criado para ajudar e conversar com você!';
  }
  
  return 'Interessante! Me conte mais sobre isso...';
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      setTimeout(() => {
        const botResponse = getBotResponse(userMessage.text);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
        textToSpeech(botResponse);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    toast({
      title: "Entrada por Voz",
      description: "Funcionalidade de entrada por voz em breve!",
    });
  };

  const handleSpeakMessage = async (text: string) => {
    try {
      await textToSpeech(text);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reproduzir o áudio.",
        variant: "destructive",
      });
    }
  };

  const getLastBotMessage = (messages: Message[]): Message | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isUser) {
        return messages[i];
      }
    }
    return undefined;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-semibold">Assistente AI</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              const lastBotMessage = getLastBotMessage(messages);
              if (lastBotMessage) {
                handleSpeakMessage(lastBotMessage.text);
              }
            }}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <LoadingDots />}
          </div>
          <div ref={scrollRef} />
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleVoiceInput}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Digite sua mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-10"
            />
            <Button
              className="shrink-0"
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;