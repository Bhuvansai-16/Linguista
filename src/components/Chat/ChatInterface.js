import React, { useState, useRef, useEffect } from 'react';
import { nlpAPI } from '../../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: `👋 Hi there! I'm your NLP expert assistant. I can help you with:

• Answering questions about NLP concepts and techniques
• Explaining NLP-related code
• Comparing implementations across different libraries

Choose a chat mode from the options panel and let's get started!`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addThinkingMessage = () => {
    const thinkingMessage = {
      id: Date.now(),
      type: 'thinking',
      content: 'Thinking...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);
    return thinkingMessage.id;
  };

  const removeMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const message = inputValue.trim();
    if (!message) return;

    // Add user message
    addMessage('user', message);
    setInputValue('');
    setIsLoading(true);

    // Add thinking message
    const thinkingId = addThinkingMessage();

    try {
      const response = await nlpAPI.chat({
        type: 'general',
        message: message
      });

      // Remove thinking message
      removeMessage(thinkingId);

      if (response.success) {
        addMessage('system', response.response);
      } else {
        addMessage('system', `Error: ${response.error}`);
      }
    } catch (error) {
      // Remove thinking message
      removeMessage(thinkingId);
      addMessage('system', 'An error occurred while sending your message.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuestion = (question) => {
    setInputValue(question);
  };

  const renderMessage = (message) => {
    if (message.type === 'thinking') {
      return (
        <div key={message.id} className="message-wrapper system-message">
          <div className="message-content">
            <div className="message-header d-flex align-items-center">
              <div className="message-avatar">
                <i className="bi bi-robot"></i>
              </div>
              <div className="message-sender">Linguista</div>
            </div>
            <div className="message-body">
              <div className="thinking-message">
                <span>Thinking</span>
                <div className="thinking-dots">
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className={`message-wrapper ${message.type}-message`}>
        <div className="message-content">
          <div className="message-header d-flex align-items-center">
            <div className="message-avatar">
              <i className={`bi ${message.type === 'user' ? 'bi-person' : 'bi-robot'}`}></i>
            </div>
            <div className="message-sender">
              {message.type === 'user' ? 'You' : 'Linguista'}
            </div>
          </div>
          <div className="message-body">
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card border-0 shadow-sm chat-container">
      <div className="card-body p-0">
        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-form">
            <div className="input-group">
              <textarea 
                className="form-control chat-input" 
                placeholder="Ask a question about NLP..." 
                rows="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={isLoading || !inputValue.trim()}
              >
                <i className="bi bi-send"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;