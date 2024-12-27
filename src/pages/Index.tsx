import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { textToSpeech } from "@/services/textToSpeech";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Add proper type declarations for the SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({
        title: "Microfone desativado",
        description: "O microfone foi desligado.",
      });
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      const userMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        setTimeout(() => {
          const botResponse = getBotResponse(transcript);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsLoading(false);
          textToSpeech(botResponse, setIsSpeaking);
        }, 1000);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar sua mensagem.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event);
      toast({
        title: "Erro",
        description: "Ocorreu um erro no reconhecimento de voz.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognition.start();
    setIsListening(true);
    toast({
      title: "Microfone ativado",
      description: "O microfone está capturando sua voz.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 ${
            isListening || isSpeaking ? "animate-pulse" : ""
          }`}
          onClick={handleVoiceInput}
        >
          <div
            className={`w-24 h-24 rounded-full bg-white ${
              isSpeaking ? "animate-sound-wave" : ""
            }`}
          ></div>
        </div>
        <button
          onClick={handleVoiceInput}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {isListening ? "Escutando..." : "Começar a Escutar"}
        </button>
      </div>

      <style>
        {`
          @keyframes sound-wave {
            0% {
              box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.5);
            }
            100% {
              box-shadow: 0 0 20px 20px rgba(0, 0, 255, 0);
            }
          }

          .animate-sound-wave {
            animation: sound-wave 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Index;