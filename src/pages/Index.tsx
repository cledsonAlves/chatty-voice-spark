import { useState, useRef } from "react";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { useToast } from "@/hooks/use-toast";

const getBotResponse = async (userMessage) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar resposta da API do Groq");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";
  } catch (error) {
    console.error("Erro na API do Groq:", error);
    return "Houve um problema ao conectar com a API. Tente novamente mais tarde.";
  }
};

const textToSpeech = async (text: string) => {
  const client = new PollyClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: "AKIA4T4OCLRRIEQHUEE5",
      secretAccessKey: "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",
    },
  });

  try {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Vitoria",
      Engine: "neural",
    });

    const response = await client.send(command);

    if (response.AudioStream) {
      const audioChunks = [];
      const reader = response.AudioStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) audioChunks.push(value);
      }

      const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.play().catch((error) => {
        console.error("Erro ao reproduzir áudio:", error);
      });
    } else {
      console.error("Nenhum áudio retornado pelo Polly.");
    }
  } catch (error) {
    console.error("Erro ao sintetizar áudio com Polly:", error);
  }
};

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
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

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      toast({
        title: "Mensagem capturada",
        description: transcript,
      });

      const botResponse = await getBotResponse(transcript);
      await textToSpeech(botResponse, setIsSpeaking);
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
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

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default Index;
