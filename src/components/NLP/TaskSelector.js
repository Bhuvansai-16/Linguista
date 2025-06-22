import React from 'react';

const TaskSelector = ({ selectedTask, onTaskChange, selectedLibrary, onLibraryChange }) => {
  const tasks = [
    { value: 'tokenization', label: 'Tokenization' },
    { value: 'stopword_removal', label: 'Stopword Removal' },
    { value: 'lemmatization', label: 'Lemmatization' },
    { value: 'pos_tagging', label: 'Part-of-Speech Tagging' },
    { value: 'ner', label: 'Named Entity Recognition' },
    { value: 'sentiment_analysis', label: 'Sentiment Analysis' },
    { value: 'text_summarization', label: 'Text Summarization' },
    { value: 'keyword_extraction', label: 'Keyword Extraction' },
    { value: 'text_similarity', label: 'Text Similarity' },
    { value: 'language_detection', label: 'Language Detection' },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-bottom">
        <h2 className="fs-5 mb-0">
          <i className="bi bi-sliders me-2"></i>Configure Task
        </h2>
      </div>
      <div className="card-body">
        <div className="task-selector mb-4">
          <label htmlFor="task-select" className="form-label fw-semibold">
            Select NLP Task
          </label>
          <div className="input-group">
            <span className="input-group-text bg-secondary bg-opacity-10 border-0">
              <i className="bi bi-list-task"></i>
            </span>
            <select 
              className="form-select" 
              id="task-select"
              value={selectedTask}
              onChange={(e) => onTaskChange(e.target.value)}
            >
              {tasks.map((task) => (
                <option key={task.value} value={task.value}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
          <small className="form-text text-muted mt-2">
            Choose from various NLP operations
          </small>
        </div>
        
        <div className="library-selector mb-4">
          <label className="form-label fw-semibold">Choose Library</label>
          <div className="btn-group w-100" role="group">
            <input 
              type="radio" 
              className="btn-check" 
              name="library" 
              id="nltk-option" 
              value="nltk" 
              checked={selectedLibrary === 'nltk'}
              onChange={(e) => onLibraryChange(e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="nltk-option">
              <i className="bi bi-box me-1"></i> NLTK
            </label>
            <input 
              type="radio" 
              className="btn-check" 
              name="library" 
              id="spacy-option" 
              value="spacy"
              checked={selectedLibrary === 'spacy'}
              onChange={(e) => onLibraryChange(e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="spacy-option">
              <i className="bi bi-lightning me-1"></i> spaCy
            </label>
          </div>
          <small className="form-text text-muted mt-2">
            Compare implementations across libraries
          </small>
        </div>
      </div>
    </div>
  );
};

export default TaskSelector;