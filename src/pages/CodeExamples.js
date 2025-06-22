import React, { useState } from 'react';
import { nlpAPI } from '../services/api';

const CodeExamples = () => {
  const [activeTab, setActiveTab] = useState('library-comparison');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Library Comparison State
  const [sourceLibrary, setSourceLibrary] = useState('nltk');
  const [targetLibrary, setTargetLibrary] = useState('spacy');
  const [sourceCode, setSourceCode] = useState('');
  const [includePerformance, setIncludePerformance] = useState(true);
  const [comparisonResult, setComparisonResult] = useState('');

  // Pair Programming State
  const [taskDescription, setTaskDescription] = useState('');
  const [preferredLibrary, setPreferredLibrary] = useState('nltk');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExplanation, setCodeExplanation] = useState('');

  // Templates State
  const [templateCategory, setTemplateCategory] = useState('tokenization');
  const [templateLibrary, setTemplateLibrary] = useState('nltk');
  const [templateComplexity, setTemplateComplexity] = useState('basic');
  const [templateCode, setTemplateCode] = useState('');
  const [templateExplanation, setTemplateExplanation] = useState('');

  const compareLibraries = async () => {
    if (!sourceCode.trim()) {
      setError('Please enter some code to compare');
      return;
    }

    setLoading(true);
    setError(null);
    setComparisonResult('');

    try {
      const response = await nlpAPI.chat({
        type: 'library_comparison',
        code: sourceCode,
        source_library: sourceLibrary,
        target_library: targetLibrary,
        include_performance: includePerformance
      });

      if (response.success) {
        setComparisonResult(response.response);
      } else {
        setError(response.error || 'Error comparing libraries');
      }
    } catch (err) {
      console.error('Library comparison error:', err);
      setError('Error comparing libraries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!taskDescription.trim()) {
      setError('Please describe the task you want to implement');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCode('');
    setCodeExplanation('');

    try {
      const prompt = `As a Python NLP developer, I need code for the following task: ${taskDescription}.
      
      Please use the ${preferredLibrary} library and write the code targeting a ${experienceLevel} level programmer. Include:
      1. Clear, well-commented code
      2. Imports and any necessary setup
      3. Explanation of key concepts and functions
      4. Sample input/output if applicable`;

      const response = await nlpAPI.chat({
        type: 'general',
        message: prompt
      });

      if (response.success) {
        // Parse the response to extract code and explanation
        const responseText = response.response;
        
        // Extract code blocks
        const codeMatch = responseText.match(/```python\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/```\s*([\s\S]*?)\s*```/);
        const code = codeMatch ? codeMatch[1] : '';
        
        // Remove code blocks to get explanation
        const explanation = responseText
          .replace(/```python\s*[\s\S]*?\s*```/g, '')
          .replace(/```\s*[\s\S]*?\s*```/g, '');
        
        setGeneratedCode(code);
        setCodeExplanation(explanation);
      } else {
        setError(response.error || 'Error generating code');
      }
    } catch (err) {
      console.error('Code generation error:', err);
      setError('Error generating code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = async () => {
    setLoading(true);
    setError(null);
    setTemplateCode('');
    setTemplateExplanation('');

    try {
      const prompt = `As a Python NLP developer, I need a ${templateComplexity} level code template for ${templateCategory} using the ${templateLibrary} library.
      
      Please provide:
      1. Clear, well-commented code
      2. All necessary imports
      3. A brief explanation of how it works
      4. Sample input to test with`;

      const response = await nlpAPI.chat({
        type: 'general',
        message: prompt
      });

      if (response.success) {
        // Parse the response to extract code and explanation
        const responseText = response.response;
        
        // Extract code blocks
        const codeMatch = responseText.match(/```python\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/```\s*([\s\S]*?)\s*```/);
        const code = codeMatch ? codeMatch[1] : '';
        
        // Remove code blocks to get explanation
        const explanation = responseText
          .replace(/```python\s*[\s\S]*?\s*```/g, '')
          .replace(/```\s*[\s\S]*?\s*```/g, '');
        
        setTemplateCode(code);
        setTemplateExplanation(explanation);
      } else {
        setError(response.error || 'Error fetching template');
      }
    } catch (err) {
      console.error('Template fetch error:', err);
      setError('Error fetching template: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert('Code copied to clipboard!'),
      () => {
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Code copied to clipboard!');
      }
    );
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">NLP Code Examples</h1>
          
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'library-comparison' ? 'active' : ''}`}
                    onClick={() => setActiveTab('library-comparison')}
                  >
                    Library Comparison
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'pair-programming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pair-programming')}
                  >
                    Pair Programming
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'code-templates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('code-templates')}
                  >
                    Templates
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {/* Error Display */}
              {error && (
                <div className="alert alert-danger mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Library Comparison Tab */}
              {activeTab === 'library-comparison' && (
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="source-library">Source Library:</label>
                        <select 
                          className="form-select"
                          value={sourceLibrary}
                          onChange={(e) => setSourceLibrary(e.target.value)}
                        >
                          <option value="nltk">NLTK</option>
                          <option value="spacy">spaCy</option>
                          <option value="scikit-learn">scikit-learn</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="target-library">Target Library:</label>
                        <select 
                          className="form-select"
                          value={targetLibrary}
                          onChange={(e) => setTargetLibrary(e.target.value)}
                        >
                          <option value="nltk">NLTK</option>
                          <option value="spacy">spaCy</option>
                          <option value="scikit-learn">scikit-learn</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="source-code">Your NLP Code:</label>
                    <textarea 
                      className="form-control code-editor" 
                      rows="10" 
                      placeholder="Enter your NLP code to translate between libraries..."
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-check mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={includePerformance}
                      onChange={(e) => setIncludePerformance(e.target.checked)}
                    />
                    <label className="form-check-label">
                      Include performance comparison
                    </label>
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={compareLibraries}
                    disabled={loading}
                  >
                    <i className="bi bi-translate"></i> 
                    {loading ? ' Comparing...' : ' Compare Libraries'}
                  </button>
                  
                  {comparisonResult && (
                    <div className="mt-4">
                      <h4>Comparison Results</h4>
                      <div className="card">
                        <div className="card-body">
                          <pre style={{ whiteSpace: 'pre-wrap' }}>{comparisonResult}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pair Programming Tab */}
              {activeTab === 'pair-programming' && (
                <div>
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Describe what NLP task you want to implement, and Gemini will help you write it.
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="task-description">Task Description:</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="Describe the NLP task you want to implement..."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="preferred-library">Preferred Library:</label>
                        <select 
                          className="form-select"
                          value={preferredLibrary}
                          onChange={(e) => setPreferredLibrary(e.target.value)}
                        >
                          <option value="nltk">NLTK</option>
                          <option value="spacy">spaCy</option>
                          <option value="scikit-learn">scikit-learn</option>
                          <option value="tensorflow">TensorFlow</option>
                          <option value="pytorch">PyTorch</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="experience-level">Your Experience Level:</label>
                        <select 
                          className="form-select"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={generateCode}
                    disabled={loading}
                  >
                    <i className="bi bi-code-slash"></i> 
                    {loading ? ' Generating...' : ' Generate Code'}
                  </button>
                  
                  {(generatedCode || codeExplanation) && (
                    <div className="mt-4">
                      <h4>Generated Code</h4>
                      {generatedCode && (
                        <div className="card mb-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Code</span>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(generatedCode)}
                            >
                              <i className="bi bi-clipboard"></i> Copy
                            </button>
                          </div>
                          <div className="card-body">
                            <pre><code>{generatedCode}</code></pre>
                          </div>
                        </div>
                      )}
                      
                      {codeExplanation && (
                        <div className="card">
                          <div className="card-header">Explanation</div>
                          <div className="card-body">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{codeExplanation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Code Templates Tab */}
              {activeTab === 'code-templates' && (
                <div>
                  <div className="form-group mb-3">
                    <label htmlFor="template-category">Template Category:</label>
                    <select 
                      className="form-select"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                    >
                      <option value="tokenization">Tokenization</option>
                      <option value="stopwords">Stopword Removal</option>
                      <option value="lemmatization">Lemmatization</option>
                      <option value="pos-tagging">POS Tagging</option>
                      <option value="ner">Named Entity Recognition</option>
                      <option value="sentiment">Sentiment Analysis</option>
                      <option value="text-classification">Text Classification</option>
                      <option value="embeddings">Word/Sentence Embeddings</option>
                    </select>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="template-library">Library:</label>
                        <select 
                          className="form-select"
                          value={templateLibrary}
                          onChange={(e) => setTemplateLibrary(e.target.value)}
                        >
                          <option value="nltk">NLTK</option>
                          <option value="spacy">spaCy</option>
                          <option value="huggingface">HuggingFace</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="template-complexity">Complexity:</label>
                        <select 
                          className="form-select"
                          value={templateComplexity}
                          onChange={(e) => setTemplateComplexity(e.target.value)}
                        >
                          <option value="basic">Basic</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={getTemplate}
                    disabled={loading}
                  >
                    <i className="bi bi-file-code"></i> 
                    {loading ? ' Fetching...' : ' Get Template'}
                  </button>
                  
                  {(templateCode || templateExplanation) && (
                    <div className="mt-4">
                      <h4>Code Template</h4>
                      {templateCode && (
                        <div className="card mb-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Template Code</span>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(templateCode)}
                            >
                              <i className="bi bi-clipboard"></i> Copy
                            </button>
                          </div>
                          <div className="card-body">
                            <pre><code>{templateCode}</code></pre>
                          </div>
                        </div>
                      )}
                      
                      {templateExplanation && (
                        <div className="card">
                          <div className="card-header">Explanation</div>
                          <div className="card-body">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{templateExplanation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamples;