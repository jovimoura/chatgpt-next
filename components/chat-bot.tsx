"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpIcon,
  BarChart3Icon,
  CalculatorIcon,
  FileTextIcon,
  LineChart,
} from "lucide-react";
import { Button } from "./ui/button";
import { chat, Message } from "@/actions/chat";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";

const prompts = [
  {
    icon: <CalculatorIcon strokeWidth={1.8} className="size-5" />,
    text: "Generate a random number between 1 and 100",
  },
  {
    icon: <LineChart strokeWidth={1.8} className="size-5" />,
    text: "Provide a 12-month cash flow forecast",
  },
  {
    icon: <FileTextIcon strokeWidth={1.8} className="size-5" />,
    text: "Book a journal entry",
  },
  {
    icon: <BarChart3Icon strokeWidth={1.8} className="size-5" />,
    text: "Create a real-time financial board",
  },
];

export function Chatbot() {
  const inputRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.textContent = prompt;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setInput("");
    setIsLoading(true);
    setConversation((prev) => [...prev, userMessage]);
    setHasChatStarted(true);

    try {
      const { newMessage } = await chat([...conversation, userMessage]);

      let textContent = "";

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
      };

      setConversation((prev) => [...prev, assistantMessage]);

      for await (const textMessage of readStreamableValue(newMessage)) {
        textContent += textMessage;
        setConversation((prev) => {
          const newConversation = [...prev];
          newConversation[newConversation.length - 1] = {
            role: "assistant",
            content: textContent,
          };
          return newConversation;
        });
      }
    } catch (error) {
      console.error(error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative h-full flex flex-col space-y-4  items-center pb-4">
      <div className="flex-1 w-full max-w-3xl px-4">
        {!hasChatStarted ? (
          <div className="flex flex-col justify-end h-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-semibold">Hi there👋</h1>
              <span className="text-xl text-muted-foreground">
                What can I help you with?
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
              <AnimatePresence>
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      bounce: 0.3,
                      delay: index * 0.05,
                    }}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-muted transition-all text-sm"
                  >
                    {prompt.icon}
                    <span>{prompt.text}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
           <motion.div
                        animate={{
                            paddingBottom: input ? (input.split("\n").length > 3 ? "206px" : "110px") : "80px"
                        }}
                        transition={{ duration: 0.2 }}
                        className="pt-8 space-y-4"
                    >
                        {conversation.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex",
                                    {
                                        "justify-end": message.role === "user",
                                        "justify-start": message.role === "assistant"
                                    }
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-xl px-4 py-2",
                                    {
                                        "bg-foreground text-background": message.role === "user",
                                        "bg-muted": message.role === "assistant",
                                    }
                                )}>
                                    {message.role === "assistant" ? (
                                        <MarkdownRenderer message={message} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messageEndRef} />
                    </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          position: hasChatStarted ? "fixed" : "relative",
        }}
        className="w-full bg-linear-to-t from-white via-white to-transparent pb-4pt-6 bottom-0 mt-auto"
      >
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            animate={{ height: "auto" }}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="relative border rounded-2xl lg:rounded-e-3xl p-2.5 flex items-end gap-2 bg-background"
          >
            <div
              contentEditable
              role="textbox"
              ref={(element) => {
                inputRef.current = element;
                if (element && !input) {
                  element.textContent = "";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onInput={(e) => setInput(e.currentTarget.textContent || "")}
              data-placeholder="Type a message..."
              className="flex-1 min-h-[36px] overflow-y-auto px-3 py-2 focus:outline-hidden text-sm bg-background rounded-md empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]) whitespace-pre-wrap break-words"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full shrink-0 mb-0.5"
            >
              <ArrowUpIcon strokeWidth={2.5} className="size-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
