import React, { useState } from 'react';

const ChatOptions = ({ onExampleQuestion }) => {
  const [activeTab, setActiveTab] = useState('general');

  const exampleQuestions = [
    "What is tokenization?",
    "Explain word embeddings",
    "When should I use BERT?",
    "What's the difference between NLTK and spaCy?",
    "How does sentiment analysis work?",
    "What are transformer models?"
  ];

  return (
    <div className="card border-0 shadow-sm mb-4 chat-options-panel">
      <div className="card-header bg-transparent border-bottom">
        <h2 className="fs-5 mb-0">
          <i className="bi bi-chat-square-dots me-2"></i>Chat Options
        </h2>
      </div>
      <div className="card-body">
        <div className="chat-mode-tabs mb-4">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                type="button"
              >
                <i className="bi bi-chat-dots me-1"></i> General
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'compare' ? 'active' : ''}`}
                onClick={() => setActiveTab('compare')}
                type="button"
              >
                <i className="bi bi-arrow-left-right me-1"></i> Compare
              </button>
            </li>
          </ul>
          
          <div className="tab-content pt-3">
            {/* General Chat Options */}
            {activeTab === 'general' && (
              <div className="tab-pane fade show active">
                <p className="text-muted mb-3">
                  Ask questions about NLP concepts, techniques, or applications.
                </p>
                
                <div className="example-questions">
                  <p className="mb-2 fw-semibold">Example questions:</p>
                  <div className="example-chips d-flex flex-wrap gap-2 mb-3">
                    {exampleQuestions.map((question, index) => (
                      <button 
                        key={index}
                        className="btn btn-sm btn-outline-primary example-question-btn"
                        onClick={() => onExampleQuestion(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Library Comparison Options */}
            {activeTab === 'compare' && (
              <div className="tab-pane fade show active">
                <p className="text-muted mb-3">
                  Compare implementations across different NLP libraries.
                </p>
                
                <div className="library-comparison-form">
                  <div className="form-group mb-3">
                    <label htmlFor="source-library" className="form-label fw-semibold">
                      Source Library
                    </label>
                    <select className="form-select" id="source-library">
                      <option value="nltk">NLTK</option>
                      <option value="spacy">spaCy</option>
                      <option value="sklearn">scikit-learn</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="target-library" className="form-label fw-semibold">
                      Target Library
                    </label>
                    <select className="form-select" id="target-library">
                      <option value="spacy">spaCy</option>
                      <option value="nltk">NLTK</option>
                      <option value="sklearn">scikit-learn</option>
                    </select>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="include-performance" 
                      defaultChecked 
                    />
                    <label className="form-check-label" htmlFor="include-performance">
                      Include performance comparison
                    </label>
                  </div>
                  
                  <div className="code-input mb-3">
                    <label htmlFor="compare-textarea" className="form-label fw-semibold">
                      Code to Convert
                    </label>
                    <textarea 
                      className="form-control code-textarea" 
                      id="compare-textarea" 
                      rows="8" 
                      placeholder="Paste code from source library here..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOptions;