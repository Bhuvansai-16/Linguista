import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { nlpAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Visualizations = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Performance comparison state
  const [perfTask, setPerfTask] = useState('tokenization');
  const [perfTextSize, setPerfTextSize] = useState('medium');
  const [perfResults, setPerfResults] = useState(null);

  // Custom visualization state
  const [customVizTask, setCustomVizTask] = useState('sentiment_analysis');
  const [customVizText, setCustomVizText] = useState('');
  const [customVizComparisonText, setCustomVizComparisonText] = useState('');
  const [customVizResults, setCustomVizResults] = useState(null);

  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const simulatePerformanceData = (task, textSize) => {
    // Simulated performance data
    const taskMultipliers = {
      'tokenization': { nltk: 1.0, spacy: 0.5 },
      'pos_tagging': { nltk: 1.5, spacy: 0.7 },
      'ner': { nltk: 2.0, spacy: 0.8 },
      'lemmatization': { nltk: 1.2, spacy: 0.6 },
      'stopword_removal': { nltk: 0.8, spacy: 0.4 }
    };

    const sizeMultipliers = {
      'small': 1,
      'medium': 2.5,
      'large': 6
    };

    const baseTime = 100; // milliseconds
    const taskMultiplier = taskMultipliers[task] || { nltk: 1.0, spacy: 0.5 };
    const sizeMultiplier = sizeMultipliers[textSize] || 1;

    const randomFactor = () => 0.8 + Math.random() * 0.4;

    const nltkTime = baseTime * taskMultiplier.nltk * sizeMultiplier * randomFactor();
    const spacyTime = baseTime * taskMultiplier.spacy * sizeMultiplier * randomFactor();

    const nltkMemory = (25 + Math.random() * 10) * sizeMultiplier;
    const spacyMemory = (60 + Math.random() * 20) * sizeMultiplier;

    const nltkAccuracy = 0.82 + Math.random() * 0.1;
    const spacyAccuracy = 0.85 + Math.random() * 0.1;

    let analysis = '';
    if (nltkTime < spacyTime) {
      analysis += 'NLTK was faster for this task, but typically uses less memory than spaCy. ';
    } else {
      analysis += 'spaCy was faster for this task due to its optimized C implementation. ';
    }

    analysis += `For ${task.replace('_', ' ')}, spaCy ${spacyAccuracy > nltkAccuracy ? 'typically achieves higher accuracy' : 'and NLTK have similar accuracy'}. `;

    if (task === 'ner' || task === 'pos_tagging') {
      analysis += 'spaCy\'s models are pre-trained on large datasets, which can provide better results for complex texts. ';
    }

    analysis += `For ${textSize} texts, ${nltkMemory < spacyMemory ? 'NLTK uses less memory and may be preferred for resource-constrained environments.' : 'both libraries perform well, with spaCy being more efficient for processing speed.'}`;

    return {
      task: task.replace('_', ' '),
      textSize: textSize,
      metrics: [
        { name: 'Processing Time (ms)', nltk: nltkTime, spacy: spacyTime },
        { name: 'Memory Usage (MB)', nltk: nltkMemory, spacy: spacyMemory },
        { name: 'Accuracy', nltk: nltkAccuracy, spacy: spacyAccuracy }
      ],
      analysis: analysis
    };
  };

  const runPerformanceComparison = () => {
    setLoading(true);
    setError(null);

    // Simulate processing delay
    setTimeout(() => {
      const data = simulatePerformanceData(perfTask, perfTextSize);
      setPerfResults(data);
      setLoading(false);
    }, 1500);
  };

  const generateCustomVisualization = async () => {
    if (!customVizText.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    if (customVizTask === 'text_similarity' && !customVizComparisonText.trim()) {
      setError('Please enter comparison text for similarity analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setCustomVizResults(null);

    try {
      // Process with NLTK
      const nltkRequest = {
        task: customVizTask,
        text: customVizText,
        library: 'nltk'
      };

      if (customVizTask === 'text_similarity') {
        nltkRequest.comparison_text = customVizComparisonText;
      }

      const nltkResponse = await nlpAPI.processText(nltkRequest);

      // Process with spaCy
      const spacyRequest = {
        task: customVizTask,
        text: customVizText,
        library: 'spacy'
      };

      if (customVizTask === 'text_similarity') {
        spacyRequest.comparison_text = customVizComparisonText;
      }

      const spacyResponse = await nlpAPI.processText(spacyRequest);

      if (nltkResponse.success && spacyResponse.success) {
        setCustomVizResults({
          nltk: nltkResponse,
          spacy: spacyResponse
        });
      } else {
        setError('Error processing text with one or both libraries');
      }
    } catch (err) {
      console.error('Custom visualization error:', err);
      setError('Error generating visualization: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPerformanceChart = () => {
    if (!perfResults) return null;

    const data = {
      labels: ['NLTK', 'spaCy'],
      datasets: [
        {
          label: 'Processing Time (ms)',
          data: [perfResults.metrics[0].nltk, perfResults.metrics[0].spacy],
          backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)'],
          borderColor: ['rgb(54, 162, 235)', 'rgb(75, 192, 192)'],
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${perfResults.task} Performance Comparison`,
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Processing Time (ms)'
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const renderCustomVisualizationChart = () => {
    if (!customVizResults) return null;

    const { nltk, spacy } = customVizResults;

    if (customVizTask === 'sentiment_analysis') {
      const data = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            label: 'NLTK',
            data: [
              nltk.result.scores?.pos || 0,
              nltk.result.scores?.neg || 0,
              nltk.result.scores?.neu || 0
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
          },
          {
            label: 'spaCy',
            data: [
              spacy.result.scores?.pos || 0,
              spacy.result.scores?.neg || 0,
              spacy.result.scores?.neu || 0
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            pointBackgroundColor: 'rgb(75, 192, 192)',
          }
        ]
      };

      const options = {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sentiment Analysis Comparison',
            font: { size: 16 }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 1
          }
        }
      };

      return <Radar data={data} options={options} />;
    }

    return null;
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">NLP Visualizations</h1>

          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                  >
                    Performance Comparison
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
                    onClick={() => setActiveTab('features')}
                  >
                    Feature Comparison
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('custom')}
                  >
                    Custom Visualization
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

              {/* Performance Comparison Tab */}
              {activeTab === 'performance' && (
                <div>
                  <div className="alert alert-info mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Compare performance metrics between NLTK and spaCy for various NLP tasks.
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label>NLP Task:</label>
                        <select 
                          className="form-select"
                          value={perfTask}
                          onChange={(e) => setPerfTask(e.target.value)}
                        >
                          <option value="tokenization">Tokenization</option>
                          <option value="pos_tagging">POS Tagging</option>
                          <option value="ner">Named Entity Recognition</option>
                          <option value="lemmatization">Lemmatization</option>
                          <option value="stopword_removal">Stopword Removal</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label>Sample Text Size:</label>
                        <select 
                          className="form-select"
                          value={perfTextSize}
                          onChange={(e) => setPerfTextSize(e.target.value)}
                        >
                          <option value="small">Small (Few sentences)</option>
                          <option value="medium">Medium (Paragraph)</option>
                          <option value="large">Large (Multiple paragraphs)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button 
                      className="btn btn-primary"
                      onClick={runPerformanceComparison}
                      disabled={loading}
                    >
                      <i className="bi bi-bar-chart"></i> 
                      {loading ? ' Running...' : ' Run Performance Comparison'}
                    </button>
                  </div>

                  {loading && (
                    <div className="text-center my-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Running comparison...</p>
                    </div>
                  )}

                  {perfResults && !loading && (
                    <div>
                      <h4 className="mb-3">Performance Results</h4>
                      <div className="row">
                        <div className="col-md-8">
                          <div style={{ height: '400px' }}>
                            {renderPerformanceChart()}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card">
                            <div className="card-header">
                              <h5 className="card-title mb-0">Analysis</h5>
                            </div>
                            <div className="card-body">
                              <p>{perfResults.analysis}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5>Detailed Results</h5>
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>NLTK</th>
                              <th>spaCy</th>
                              <th>Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {perfResults.metrics.map((metric, index) => {
                              const diff = metric.spacy - metric.nltk;
                              const diffClass = diff < 0 ? 'text-success' : (diff > 0 ? 'text-danger' : '');
                              const diffPrefix = diff < 0 ? '-' : (diff > 0 ? '+' : '');
                              const diffText = diff !== 0 ? `${diffPrefix}${Math.abs(diff).toFixed(2)}` : '0.00';

                              return (
                                <tr key={index}>
                                  <td>{metric.name}</td>
                                  <td>{metric.nltk.toFixed(2)}</td>
                                  <td>{metric.spacy.toFixed(2)}</td>
                                  <td className={diffClass}>{diffText}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feature Comparison Tab */}
              {activeTab === 'features' && (
                <div>
                  <div className="alert alert-info mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Compare feature sets and capabilities between NLTK and spaCy.
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                          <h5 className="card-title mb-0">NLTK</h5>
                        </div>
                        <div className="card-body">
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Ease of Installation
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Processing Speed
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Memory Usage
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Customizability
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Modern API
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Documentation
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Built-in Models
                              <span className="badge bg-primary rounded-pill">⭐⭐⭐</span>
                            </li>
                          </ul>
                        </div>
                        <div className="card-footer">
                          <p><strong>Ideal for:</strong> Research, education, prototyping, and working with limited computational resources.</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-success text-white">
                          <h5 className="card-title mb-0">spaCy</h5>
                        </div>
                        <div className="card-body">
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Ease of Installation
                              <span className="badge bg-success rounded-pill">⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Processing Speed
                              <span className="badge bg-success rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Memory Usage
                              <span className="badge bg-success rounded-pill">⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Customizability
                              <span className="badge bg-success rounded-pill">⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Modern API
                              <span className="badge bg-success rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Documentation
                              <span className="badge bg-success rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Built-in Models
                              <span className="badge bg-success rounded-pill">⭐⭐⭐⭐⭐</span>
                            </li>
                          </ul>
                        </div>
                        <div className="card-footer">
                          <p><strong>Ideal for:</strong> Production systems, large-scale processing, and applications requiring high performance.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card mt-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Feature Availability Comparison</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Feature</th>
                              <th className="text-center">NLTK</th>
                              <th className="text-center">spaCy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['Tokenization', true, true],
                              ['Part-of-Speech Tagging', true, true],
                              ['Named Entity Recognition', true, true],
                              ['Dependency Parsing', false, true],
                              ['Word Vectors', false, true],
                              ['Text Classification', true, true],
                              ['Sentiment Analysis', true, false],
                              ['Stemming', true, false],
                              ['Lemmatization', true, true],
                              ['Multi-language Support', false, true],
                              ['GPU Acceleration', false, true],
                              ['Corpus & Dataset Access', true, false],
                            ].map(([feature, nltk, spacy], index) => (
                              <tr key={index}>
                                <td>{feature}</td>
                                <td className="text-center">
                                  <i className={`bi ${nltk ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-danger'}`}></i>
                                </td>
                                <td className="text-center">
                                  <i className={`bi ${spacy ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-danger'}`}></i>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Visualization Tab */}
              {activeTab === 'custom' && (
                <div>
                  <div className="alert alert-info mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Generate custom visualizations for comparing NLTK and spaCy on specific texts.
                  </div>

                  <div className="form-group mb-3">
                    <label>NLP Task:</label>
                    <select 
                      className="form-select"
                      value={customVizTask}
                      onChange={(e) => setCustomVizTask(e.target.value)}
                    >
                      <option value="sentiment_analysis">Sentiment Analysis</option>
                      <option value="keyword_extraction">Keyword Extraction</option>
                      <option value="text_similarity">Text Similarity</option>
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <label>Text to Analyze:</label>
                    <textarea 
                      className="form-control" 
                      rows="5" 
                      placeholder="Enter text to analyze..."
                      value={customVizText}
                      onChange={(e) => setCustomVizText(e.target.value)}
                    />
                  </div>

                  {customVizTask === 'text_similarity' && (
                    <div className="form-group mb-3">
                      <label>Comparison Text:</label>
                      <textarea 
                        className="form-control" 
                        rows="5" 
                        placeholder="Enter text to compare with..."
                        value={customVizComparisonText}
                        onChange={(e) => setCustomVizComparisonText(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <button 
                      className="btn btn-primary"
                      onClick={generateCustomVisualization}
                      disabled={loading}
                    >
                      <i className="bi bi-graph-up"></i> 
                      {loading ? ' Generating...' : ' Generate Visualization'}
                    </button>
                  </div>

                  {loading && (
                    <div className="text-center my-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Generating visualization...</p>
                    </div>
                  )}

                  {customVizResults && !loading && (
                    <div className="row">
                      <div className="col-md-12">
                        <h4 className="mb-3">Visualization Results</h4>
                        <div className="card">
                          <div className="card-body">
                            <div style={{ height: '400px' }}>
                              {renderCustomVisualizationChart()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-12 mt-4">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title mb-0">Analysis Comparison</h5>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="text-primary">NLTK Results</h6>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                                  {JSON.stringify(customVizResults.nltk.result, null, 2)}
                                </pre>
                              </div>
                              <div className="col-md-6">
                                <h6 className="text-success">spaCy Results</h6>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                                  {JSON.stringify(customVizResults.spacy.result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Visualizations;