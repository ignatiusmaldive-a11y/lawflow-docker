import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../lib/i18n";
import { api4 } from "../lib/api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatView() {
    const { t } = useI18n();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "¡Hola! Soy tu asistente de Lawflow. ¿En qué puedo ayudarte hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await api4.chat(userMsg);
            setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble-row ${m.role === "user" ? "user" : "assistant"}`}>
                        {m.role === "assistant" && <div className="chat-avatar assistant">◆</div>}
                        <div className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}`}>
                            {m.content}
                        </div>
                        {m.role === "user" && <div className="chat-avatar user">A</div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble-row assistant">
                        <div className="chat-avatar assistant">◆</div>
                        <div className="chat-bubble assistant typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
            </div>
            <div className="chat-input-row">
                <input
                    type="text"
                    className="chat-input"
                    placeholder={t("chatPlaceholder")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="chat-send-btn" onClick={handleSend} disabled={isLoading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
}
