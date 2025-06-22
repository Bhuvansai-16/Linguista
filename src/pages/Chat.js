import React, { useState } from 'react';
import ChatInterface from '../components/Chat/ChatInterface';
import ChatOptions from '../components/Chat/ChatOptions';

const Chat = () => {
  const [inputValue, setInputValue] = useState('');

  const handleExampleQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="chat-page">
      <div className="page-header mb-4">
        <h1 className="page-title">AI Assistant</h1>
        <p className="text-muted">Ask questions about NLP concepts, get code explanations, or compare libraries</p>
      </div>
      
      <div className="row g-4">
        <div className="col-lg-4">
          {/* Chat Options Panel */}
          <ChatOptions onExampleQuestion={handleExampleQuestion} />
        </div>
        
        <div className="col-lg-8">
          {/* Chat Container */}
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Chat;