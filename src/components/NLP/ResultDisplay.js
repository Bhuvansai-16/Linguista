import React from 'react';

const ResultDisplay = ({ result, task, isVisible }) => {
  if (!isVisible || !result) return null;

  const renderTokens = (tokens, className = 'token') => {
    return (
      <div className="token-display">
        {tokens.map((token, index) => (
          <span key={index} className={className}>
            {token}
          </span>
        ))}
      </div>
    );
  };

  const renderSentences = (sentences) => {
    return (
      <div className="sentence-display">
        {sentences.map((sentence, index) => (
          <div key={index} className="sentence">
            {sentence}
          </div>
        ))}
      </div>
    );
  };

  const renderPOSTags = (posTags) => {
    return (
      <div className="pos-display">
        {posTags.map(([word, tag], index) => (
          <div key={index} className="pos-tag">
            <span className="pos-word">{word}</span>
            <span className="pos-label badge bg-secondary">{tag}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderEntities = (entities) => {
    return (
      <div className="entity-display">
        {entities.map((entity, index) => (
          <div key={index} className="entity-tag">
            <span className="entity-text">{entity.text}</span>
            <span className="entity-type badge bg-info">{entity.type}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderKeywords = (keywords) => {
    return (
      <div className="keyword-display">
        {keywords.map((keyword, index) => (
          <div key={index} className="keyword-item">
            <div className="keyword-word">{keyword.word}</div>
            <div className="keyword-score">Score: {keyword.score.toFixed(4)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderTaskResult = () => {
    switch (task) {
      case 'tokenization':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Word Count</div>
                    <div className="stat-value">{result.word_count}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Sentence Count</div>
                    <div className="stat-value">{result.sentence_count}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Words</h4>
                {renderTokens(result.words)}
              </div>
              <div className="result-section">
                <h4 className="result-section-title">Sentences</h4>
                {renderSentences(result.sentences)}
              </div>
            </div>
          </div>
        );

      case 'stopword_removal':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Original Word Count</div>
                    <div className="stat-value">{result.original_count}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">After Removal</div>
                    <div className="stat-value">{result.filtered_count}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Filtered Words</h4>
                {renderTokens(result.filtered_words)}
              </div>
              <div className="result-section">
                <h4 className="result-section-title">Removed Words</h4>
                {renderTokens(result.removed_words, 'token removed')}
              </div>
            </div>
          </div>
        );

      case 'lemmatization':
        return (
          <div className="task-result">
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Lemmatized Words</h4>
                {renderTokens(result.lemmatized_words)}
              </div>
              <div className="result-section">
                <h4 className="result-section-title">Changes</h4>
                <div className="lemma-display">
                  {Object.entries(result.lemma_dict || {}).map(([original, lemma], index) => (
                    <div key={index} className="lemma-item">
                      <span className="lemma-original">{original}</span>
                      <span className="lemma-arrow">
                        <i className="bi bi-arrow-right"></i>
                      </span>
                      <span className="lemma-normalized">{lemma}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'pos_tagging':
        return (
          <div className="task-result">
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Tagged Words</h4>
                {renderPOSTags(result.pos_tags || [])}
              </div>
            </div>
          </div>
        );

      case 'ner':
        return (
          <div className="task-result">
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Recognized Entities</h4>
                {renderEntities(result.entities || [])}
              </div>
            </div>
          </div>
        );

      case 'sentiment_analysis':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Overall Sentiment</div>
                    <div className={`stat-value sentiment-value ${result.sentiment}`}>
                      {result.sentiment}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Compound Score</div>
                    <div className="stat-value">{result.scores?.compound?.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="result-sections">
              <div className="result-section">
                <h4 className="result-section-title">Detailed Scores</h4>
                <div className="score-display">
                  {result.scores && Object.entries(result.scores)
                    .filter(([key]) => key !== 'compound')
                    .map(([key, value], index) => (
                      <div key={index} className="score-item">
                        <div className="score-label">{key}</div>
                        <div className="score-value">{value.toFixed(4)}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'text_summarization':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-4">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Original Length</div>
                    <div className="stat-value">{result.original_length}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Summary Length</div>
                    <div className="stat-value">{result.summary_length}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Compression Ratio</div>
                    <div className="stat-value">
                      {(result.compression_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="result-sections">
              <div className="result-section">
                <h4 className="result-section-title">Summary</h4>
                <div className="summary-display">{result.summary}</div>
              </div>
            </div>
          </div>
        );

      case 'keyword_extraction':
        return (
          <div className="task-result">
            <div className="result-sections">
              <div className="result-section">
                <h4 className="result-section-title">Top Keywords</h4>
                {renderKeywords(result.keyword_list || [])}
              </div>
            </div>
          </div>
        );

      case 'text_similarity':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Similarity Score</div>
                    <div className="stat-value">
                      {(result.similarity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="result-sections">
              <div className="result-section mb-4">
                <h4 className="result-section-title">Common Terms</h4>
                {renderTokens(result.common_terms || [])}
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="result-section">
                    <h4 className="result-section-title">Unique to Text 1</h4>
                    {renderTokens(result.text1_unique || [])}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="result-section">
                    <h4 className="result-section-title">Unique to Text 2</h4>
                    {renderTokens(result.text2_unique || [])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language_detection':
        return (
          <div className="task-result">
            <div className="result-info mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Detected Language</div>
                    <div className="stat-value">{result.language_name}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-card mb-3">
                    <div className="stat-label">Language Code</div>
                    <div className="stat-value">{result.language_code}</div>
                  </div>
                </div>
              </div>
            </div>
            {result.probabilities && result.probabilities.length > 0 && (
              <div className="result-sections">
                <div className="result-section">
                  <h4 className="result-section-title">Confidence Scores</h4>
                  <div className="probability-display">
                    {result.probabilities.map((prob, index) => (
                      <div key={index} className="probability-item">
                        <div className="probability-lang">{prob.lang}</div>
                        <div className="probability-value">
                          Confidence: {(prob.prob * 100).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="task-result">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="card border-0 shadow-sm result-container">
      <div className="card-header bg-transparent border-bottom">
        <h3 className="fs-5 mb-0">
          <i className="bi bi-clipboard-data me-2"></i>Results
        </h3>
      </div>
      <div className="card-body">
        {renderTaskResult()}
      </div>
    </div>
  );
};

export default ResultDisplay;