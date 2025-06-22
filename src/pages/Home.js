import React, { useState } from 'react';
import TaskSelector from '../components/NLP/TaskSelector';
import TextInput from '../components/NLP/TextInput';
import ResultDisplay from '../components/NLP/ResultDisplay';
import VisualizationDisplay from '../components/NLP/VisualizationDisplay';
import { nlpAPI } from '../services/api';

const Home = () => {
  const [selectedTask, setSelectedTask] = useState('tokenization');
  const [selectedLibrary, setSelectedLibrary] = useState('nltk');
  const [text, setText] = useState('');
  const [comparisonText, setComparisonText] = useState('');
  const [result, setResult] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) {
      setError('Please enter text to process.');
      return;
    }

    if (selectedTask === 'text_similarity' && !comparisonText.trim()) {
      setError('Please enter comparison text for similarity analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const requestData = {
        task: selectedTask,
        text: text,
        library: selectedLibrary,
      };

      if (selectedTask === 'text_similarity') {
        requestData.comparison_text = comparisonText;
      }

      const response = await nlpAPI.processText(requestData);

      if (response.success) {
        setResult(response.result);
        setVisualizationData(response.visualization);
        setShowResults(true);
      } else {
        setError(response.error || 'An error occurred while processing your text.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tools-page">
      <div className="page-header mb-4">
        <h1 className="page-title">NLP Tools</h1>
        <p className="text-muted">Experiment with various Natural Language Processing techniques</p>
      </div>
      
      <div className="row g-4">
        <div className="col-lg-4">
          {/* Control Panel */}
          <TaskSelector
            selectedTask={selectedTask}
            onTaskChange={setSelectedTask}
            selectedLibrary={selectedLibrary}
            onLibraryChange={setSelectedLibrary}
          />
          
          <TextInput
            text={text}
            onTextChange={setText}
            comparisonText={comparisonText}
            onComparisonTextChange={setComparisonText}
            selectedTask={selectedTask}
            onProcess={handleProcess}
          />
        </div>
        
        <div className="col-lg-8">
          {/* Loading Spinner */}
          {loading && (
            <div className="spinner-container text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Processing your request...</p>
            </div>
          )}
          
          {/* Error Container */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          
          {/* Visualization Container */}
          <VisualizationDisplay
            visualizationData={visualizationData}
            task={selectedTask}
            isVisible={showResults && !loading}
          />
          
          {/* Result Container */}
          <ResultDisplay
            result={result}
            task={selectedTask}
            isVisible={showResults && !loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;