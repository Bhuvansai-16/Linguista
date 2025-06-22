import React, { useState } from 'react';
import { nlpAPI } from '../services/api';

const NLPBasics = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topics = [
    { value: 'tokenization', label: 'Tokenization' },
    { value: 'word-embeddings', label: 'Word Embeddings' },
    { value: 'transformers', label: 'Transformer Models' },
    { value: 'text-classification', label: 'Text Classification' },
    { value: 'named-entity-recognition', label: 'Named Entity Recognition' },
    { value: 'sentiment-analysis', label: 'Sentiment Analysis' },
    { value: 'language-modeling', label: 'Language Modeling' },
    { value: 'machine-translation', label: 'Machine Translation' },
  ];

  const resources = [
    {
      category: 'Online Courses',
      items: [
        {
          title: 'DeepLearning.AI NLP Specialization',
          description: 'Build and train neural networks for NLP tasks',
          url: 'https://www.deeplearning.ai/resources/natural-language-processing/'
        },
        {
          title: 'Coursera NLP Courses',
          description: 'Wide range of courses from beginner to advanced',
          url: 'https://www.coursera.org/courses?query=nlp'
        },
        {
          title: 'TensorFlow Text Tutorials',
          description: 'Hands-on tutorials for text processing with TensorFlow',
          url: 'https://www.tensorflow.org/text/tutorials'
        }
      ]
    },
    {
      category: 'Documentation & Guides',
      items: [
        {
          title: 'NLTK Documentation',
          description: 'Complete guide to the Natural Language Toolkit',
          url: 'https://www.nltk.org/'
        },
        {
          title: 'spaCy Usage Guides',
          description: 'Industrial-strength NLP library documentation',
          url: 'https://spacy.io/usage'
        },
        {
          title: 'Hugging Face Documentation',
          description: 'State-of-the-art NLP models and libraries',
          url: 'https://huggingface.co/docs'
        }
      ]
    },
    {
      category: 'Books & Publications',
      items: [
        {
          title: 'Speech and Language Processing',
          description: 'Comprehensive textbook by Jurafsky & Martin',
          url: 'https://web.stanford.edu/~jurafsky/slp3/'
        },
        {
          title: 'Natural Language Processing with Python',
          description: 'Practical introduction to NLP using NLTK',
          url: 'https://www.amazon.com/Natural-Language-Processing-Python-Analyzing/dp/0596516495'
        },
        {
          title: 'Dive into Deep Learning',
          description: 'Interactive book on deep learning for NLP',
          url: 'https://d2l.ai/chapter_natural-language-processing-pretraining/index.html'
        }
      ]
    }
  ];

  const generateContent = async (topic, level) => {
    if (!topic) {
      setError('Please select or enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedContent('');

    try {
      const response = await nlpAPI.generateLearningContent({
        topic: topic,
        level: level
      });

      if (response.success) {
        setGeneratedContent(response.content);
      } else {
        setError(response.error || 'There was an error generating content. Please try again.');
      }
    } catch (err) {
      console.error('Content generation error:', err);
      setError('There was an error generating content. Please try again or select a different topic.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = () => {
    generateContent(selectedTopic, selectedLevel);
  };

  const handleCustomTopicGenerate = () => {
    generateContent(customTopic, selectedLevel);
  };

  const convertMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*?)$/gm, '<h2 class="mt-4 mb-3">$1</h2>')
      .replace(/^## (.*?)$/gm, '<h3 class="mt-3 mb-2">$1</h3>')
      .replace(/^### (.*?)$/gm, '<h4 class="mt-3 mb-2">$1</h4>')
      .replace(/^\* (.*?)$/gm, '<li>$1</li>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0 bg-light text-dark rounded">$1</code>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/gm, '<pre class="bg-dark text-light p-3 rounded"><code>$2</code></pre>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>\s*)+/g, '<ul class="mb-3">$&</ul>');
    
    // Convert paragraphs
    html = html.replace(/^(?!<h[1-6]|<ul|<li|<pre)(.*?)$/gm, function(match, p1) {
      if (p1.trim() === '') return match;
      return `<p>${p1}</p>`;
    });

    return html;
  };

  return (
    <div className="nlp-basics-page">
      <div className="page-header mb-4">
        <h1 className="page-title">NLP Basics</h1>
        <p className="text-muted">Learn about the fundamental concepts and techniques in Natural Language Processing</p>
      </div>

      <div className="row g-4">
        {/* Resources Column */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h2 className="fs-5 mb-0">
                <i className="bi bi-journal-text me-2"></i>Learning Resources
              </h2>
            </div>
            <div className="card-body">
              <div className="resource-list">
                {resources.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="resource-item mb-4">
                    <h3 className="resource-title fs-5 mb-2">{category.category}</h3>
                    <div className="list-group">
                      {category.items.map((item, itemIndex) => (
                        <a 
                          key={itemIndex}
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                          <div>
                            <strong>{item.title}</strong>
                            <div className="small text-muted">{item.description}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Learning Column */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h2 className="fs-5 mb-0">
                <i className="bi bi-robot me-2"></i>AI-Powered Learning
              </h2>
            </div>
            <div className="card-body">
              <div className="ai-learning-container">
                <p className="mb-3">Generate personalized NLP learning content with AI assistance. Choose a topic to learn about:</p>

                <div className="topic-selector mb-4">
                  <select 
                    className="form-select mb-3"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="">-- Select a topic --</option>
                    {topics.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>

                  <div className="level-selector mb-3">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <div key={level} className="form-check form-check-inline">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="learning-level" 
                          id={`${level}-level`}
                          value={level}
                          checked={selectedLevel === level}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor={`${level}-level`}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleGenerateContent}
                    disabled={loading || !selectedTopic}
                  >
                    <i className="bi bi-lightning-charge me-1"></i> 
                    {loading ? 'Generating...' : 'Generate Learning Content'}
                  </button>
                </div>

                <div className="custom-topic mb-4">
                  <h3 className="fs-6 mb-2">Or specify your own topic:</h3>
                  <div className="input-group mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Text summarization techniques"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomTopicGenerate();
                        }
                      }}
                    />
                    <button 
                      className="btn btn-primary" 
                      type="button"
                      onClick={handleCustomTopicGenerate}
                      disabled={loading || !customTopic.trim()}
                    >
                      <i className="bi bi-lightning-charge"></i>
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="learning-content-container mt-4">
                    <div className="content-loading text-center mb-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Generating learning content...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="alert alert-danger mt-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Generated Content */}
                {generatedContent && !loading && (
                  <div className="learning-content-container mt-4">
                    <div className="generated-content">
                      <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                          <h3 className="card-title mb-0">
                            {selectedTopic || customTopic}
                          </h3>
                          <small>{selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level</small>
                        </div>
                        <div className="card-body">
                          <div 
                            className="learning-content-formatted"
                            dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(generatedContent) }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NLPBasics;