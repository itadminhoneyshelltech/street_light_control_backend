import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import '../styles/AIChatbot.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://streetlightapi.honeyshelltech.com/api';

// Function to trigger data refresh across the app
const triggerDashboardRefresh = () => {
  // Dispatch custom event to notify dashboard to refresh
  window.dispatchEvent(new CustomEvent('dashboardRefresh', { detail: { timestamp: Date.now() } }));
  
  // Also try to refresh via session storage for other components
  sessionStorage.setItem('lastCommandTime', Date.now().toString());
};

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  action?: any;
  intent?: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Welcome to the Smart City Control Center. I am your intelligent assistant for street light management. I have full admin access and can help you with:\n\n• Control street lights (on/off, brightness)\n• Monitor real-time status and battery levels\n• Schedule automatic operations\n• Manage system alerts and notifications\n• Access detailed energy reports\n\nHow can I assist you today? Try: "Turn on all lights" or "Show system status"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ai-chatbot/message`, {
        message: currentInput,
        userId: localStorage.getItem('userId') || useAuthStore.getState().user?.id || 1
      });

      const data = response.data.data || response.data;

      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.message || 'Command executed successfully!',
        timestamp: new Date(),
        action: data.executed_action,
        intent: data.intent
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Trigger dashboard refresh immediately if action was executed
      if (data.executed_action) {
        console.log('Action executed, triggering dashboard refresh...');
        triggerDashboardRefresh();
        // Also trigger a second refresh after 500ms to ensure data is updated
        setTimeout(() => {
          triggerDashboardRefresh();
        }, 500);
      }
    } catch (error: any) {
      console.error('AI Chatbot Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '❌ Sorry, I encountered an error: ' + (error.response?.data?.message || error.message || 'Please try again.'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickCommand = (command: string) => {
    setInput(command);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chatbot-overlay">
      <div className="ai-chatbot-container">
        <div className="chat-header">
          <div className="header-left">
            <div className="ai-avatar">💼</div>
            <div>
              <h3>Smart City Control AI</h3>
              <span className="status">
                <span className="status-dot"></span> Ready
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.action && (
                  <div className="action-details">
                    {msg.intent && (
                      <span className="intent-badge">{msg.intent}</span>
                    )}
                    <div className="action-result">
                      {JSON.stringify(msg.action).length < 100 && (
                        <pre>{JSON.stringify(msg.action, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-actions">
          <button onClick={() => quickCommand('Show status of all lights')} title="System Status">
            📊 Status
          </button>
          <button onClick={() => quickCommand('Turn on all lights')} title="Enable All">
            ⚡ Enable All
          </button>
          <button onClick={() => quickCommand('Turn off all lights')} title="Disable All">
            ⏻ Disable All
          </button>
          <button onClick={() => quickCommand('Show alerts')} title="View Alerts">
            ⚠️ Alerts
          </button>
          <button onClick={() => quickCommand('Show lights with low battery')} title="Battery Status">
            🔋 Battery
          </button>
        </div>

        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command... (e.g., 'Turn on all lights in Delhi')"
            disabled={loading}
            rows={2}
          />
          <button 
            className="send-btn" 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>

        <div className="chat-footer">
          <small>AI-powered admin control • Full system access</small>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
