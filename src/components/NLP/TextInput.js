import React, { useState, useEffect } from 'react';
import { nlpAPI } from '../../services/api';

const TextInput = ({ 
  text, 
  onTextChange, 
  comparisonText, 
  onComparisonTextChange, 
  selectedTask, 
  onProcess 
}) => {
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  const handleSampleText = async () => {
    setLoading(true);
    try {
      const response = await nlpAPI.getSampleText(selectedTask);
      if (response.success) {
        onTextChange(response.text);
        if (response.comparison_text) {
          onComparisonTextChange(response.comparison_text);
        }
      }
    } catch (error) {
      console.error('Error loading sample text:', error);
    } finally {
      setLoading(false);
    }
  };

  const showComparisonInput = selectedTask === 'text_similarity';

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="text-input mb-4">
          <label htmlFor="text-input" className="form-label fw-semibold">
            Text to Analyze
          </label>
          <textarea 
            className="form-control" 
            id="text-input" 
            rows="5" 
            placeholder="Enter text to process..."
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
          />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">{charCount} characters</small>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={handleSampleText}
              disabled={loading}
            >
              <i className="bi bi-file-text me-1"></i> 
              {loading ? 'Loading...' : 'Sample Text'}
            </button>
          </div>
        </div>
        
        {showComparisonInput && (
          <div className="comparison-input mb-4">
            <label htmlFor="comparison-text" className="form-label fw-semibold">
              Comparison Text
            </label>
            <textarea 
              className="form-control" 
              id="comparison-text" 
              rows="3" 
              placeholder="Enter text to compare with..."
              value={comparisonText}
              onChange={(e) => onComparisonTextChange(e.target.value)}
            />
            <small className="form-text text-muted mt-2">
              Required for text similarity analysis
            </small>
          </div>
        )}
        
        <div className="actions d-grid gap-2">
          <button 
            className="btn btn-primary" 
            onClick={onProcess}
            disabled={!text.trim() || (showComparisonInput && !comparisonText.trim())}
          >
            <i className="bi bi-play-fill me-1"></i> Process Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextInput;