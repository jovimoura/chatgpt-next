import { Chatbot } from "@/components/chat-bot";

export default function Home() {
  return (
    <main className="w-full h-dvh bg-background">
      <div className="max-w-4xl mx-auto h-full">
        <Chatbot />
      </div>
    </main>
  );
}
