import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full animate-slide-in-bottom",
        message.isUser ? "justify-end" : "justify-start"
      )}
    >
      <Card
        className={cn(
          "max-w-[80%] px-4 py-2",
          message.isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="leading-relaxed">{message.text}</p>
        <time className="mt-1 block text-right text-xs opacity-70">
          {format(message.timestamp, "HH:mm")}
        </time>
      </Card>
    </div>
  );
};

export default ChatMessage;