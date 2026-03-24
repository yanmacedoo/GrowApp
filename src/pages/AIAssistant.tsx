import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPlants, getEnvs } from '../store';
import './AIAssistant.css';

const API_KEY = "AIzaSyBopt2BT5szHS8p5uANyKZh-qyk3M1kgLI";
const genAI = new GoogleGenerativeAI(API_KEY);

export const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou seu inteligência artificial bot integrado ao GrowApp. Já capturei os dados das suas plantas, no que posso lhe ajudar hoje? 🌱' }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    
    const userMessage = prompt;
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    
    try {
      const plants = getPlants();
      const envs = getEnvs();
      // Context-Aware alimentando a IA com o histórico vivo da tela:
      const contextStr = `\n\nContexto do Sistema (SISTEMA INTERNO, não leia isso explícito a não ser que o usuário pergunte):\nO cultivador administra ${envs.length} ambientes e tem ${plants.length} plantas ativas. Estágios das plantas mapeadas: ${JSON.stringify(plants.map((p:any) => ({genética: p.strain, ambiente: p.environmentName, estado: p.currentStage}))) }.`;
      
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      // Instruções de Segurança e Personalidade
      const systemPrompt = `Você é um assistente bot hiper-especializado em cultivo, botânica e horticultura. Responda o usuário de forma amigável, encorajadora, concisa e formatada com markdown e lida exclusivamente em português do Brasil.\n${contextStr}\n\nMensagem do Cultivador: ${userMessage}`;
      
      const result = await model.generateContent(systemPrompt);
      const outputText = result.response.text();
      
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', text: outputText }
      ]);
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.message || String(error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', text: `⚠️ Detalhe Técnico da Falha: ${errMsg}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container max-w-4xl max-h-[80vh] flex flex-col h-full" style={{ maxWidth: '900px' }}>
      <div className="flex-header ai-header">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Sparkles className="text-accent-primary" size={28} /> Assistente IA
          </h2>
          <p className="page-subtitle">Poder de processamento Gemini. Tire dúvidas com análise instantânea dos seus clones.</p>
        </div>
      </div>

      <div className="chat-container glass-panel" style={{ background: 'rgba(12, 18, 14, 0.8)' }}>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              {m.role === 'assistant' && <Bot size={20} className="bubble-icon" />}
              {m.role === 'assistant' ? (
                <div 
                  className="bubble-text" 
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              ) : (
                <div 
                  className="bubble-text" 
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {m.text}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bubble-ai">
              <Bot size={20} className="bubble-icon" />
              <div className="bubble-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Loader2 size={16} className="animate-spin text-accent-primary" /> Processando com o Gemini...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-area">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ex: Como identificar deficiência de Nitrogênio ou Fósforo?" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
