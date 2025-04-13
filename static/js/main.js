/**
 * Main JavaScript for NLP Tools application
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const taskSelect = document.getElementById('task-select');
    const libraryOptions = document.querySelectorAll('input[name="library"]');
    const textInput = document.getElementById('text-input');
    const comparisonContainer = document.getElementById('comparison-container');
    const comparisonText = document.getElementById('comparison-text');
    const processButton = document.getElementById('process-button');
    const sampleTextBtn = document.getElementById('sample-text-btn');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorContainer = document.getElementById('error-container');
    const visualizationContainer = document.getElementById('visualization-container');
    const showExplanationBtn = document.getElementById('show-explanation');
    const explanationBtnText = document.getElementById('explanation-btn-text');
    const explanationContainer = document.getElementById('explanation-container');

    // State
    let explanationVisible = false;

    // Handle task selection change
    taskSelect.addEventListener('change', function() {
        const selectedTask = this.value;
        
        // Show/hide comparison text input for text similarity
        if (selectedTask === 'text_similarity') {
            comparisonContainer.style.display = 'block';
        } else {
            comparisonContainer.style.display = 'none';
        }
        
        // Hide results when changing task
        resultContainer.style.display = 'none';
        visualizationContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        
        // Update explanation if visible
        if (explanationVisible) {
            fetchExplanation(selectedTask);
        }
    });

    // Handle sample text button click
    sampleTextBtn.addEventListener('click', function() {
        const selectedTask = taskSelect.value;
        
        // Fetch sample text from server
        fetch(`/api/sample-text?task=${selectedTask}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch sample text');
                }
                return response.json();
            })
            .then(data => {
                textInput.value = data.text;
                // Update character counter
                document.getElementById('char-counter').textContent = data.text.length + ' characters';
                
                // Set comparison text if present
                if (data.comparison_text && comparisonText) {
                    comparisonText.value = data.comparison_text;
                }
            })
            .catch(error => {
                console.error('Error fetching sample text:', error);
                errorContainer.textContent = 'Failed to load sample text. Please try again.';
                errorContainer.style.display = 'block';
            });
    });

    // Handle process button click
    processButton.addEventListener('click', function() {
        // Get selected values
        const selectedTask = taskSelect.value;
        let selectedLibrary = 'nltk';
        
        // Get selected library
        libraryOptions.forEach(option => {
            if (option.checked) {
                selectedLibrary = option.value;
            }
        });
        
        // Get text inputs
        const text = textInput.value.trim();
        const comparison = comparisonText ? comparisonText.value.trim() : '';
        
        // Basic validation
        if (!text) {
            errorContainer.textContent = 'Please enter some text to process.';
            errorContainer.style.display = 'block';
            return;
        }
        
        if (selectedTask === 'text_similarity' && !comparison) {
            errorContainer.textContent = 'Please enter comparison text for similarity analysis.';
            errorContainer.style.display = 'block';
            return;
        }
        
        // Show loading spinner
        loadingSpinner.style.display = 'block';
        resultContainer.style.display = 'none';
        visualizationContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        
        // Send request to server
        fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: selectedTask,
                library: selectedLibrary,
                text: text,
                comparison_text: comparison
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'An error occurred while processing');
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            // Display results
            displayResults(data.result, selectedTask);
            
            // Display visualization if available
            if (data.visual_data) {
                displayVisualization(data.visual_data, selectedTask);
            }
        })
        .catch(error => {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            // Show error message
            console.error('Error:', error);
            errorContainer.textContent = error.message || 'An error occurred while processing your request.';
            errorContainer.style.display = 'block';
        });
    });

    // Handle explanation button click
    showExplanationBtn.addEventListener('click', function() {
        explanationVisible = !explanationVisible;
        
        if (explanationVisible) {
            // Show explanation
            explanationBtnText.textContent = 'Hide Explanation';
            fetchExplanation(taskSelect.value);
        } else {
            // Hide explanation
            explanationBtnText.textContent = 'Show Explanation';
            explanationContainer.style.display = 'none';
        }
    });

    // Display results based on task
    function displayResults(result, task) {
        const resultBody = resultContainer.querySelector('.card-body');
        
        // Clear previous results
        resultBody.innerHTML = '';
        
        // Create results based on task
        let html = '';
        
        switch (task) {
            case 'tokenization':
                html += `
                    <h4>Word Tokenization</h4>
                    <p>Found ${result.word_count} words:</p>
                    <div class="highlighted-text">
                        ${result.words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                    </div>
                    
                    <h4>Sentence Tokenization</h4>
                    <p>Found ${result.sentence_count} sentences:</p>
                    <div class="list-group">
                        ${result.sentences.map(s => `<div class="list-group-item">${s}</div>`).join('')}
                    </div>
                `;
                break;
                
            case 'stopword_removal':
                html += `
                    <h4>Stopword Removal Results</h4>
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Original Text</h5>
                                </div>
                                <div class="card-body">
                                    <p>Word count: ${result.original_count}</p>
                                    <div class="highlighted-text">
                                        ${result.original_words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Without Stopwords</h5>
                                </div>
                                <div class="card-body">
                                    <p>Word count: ${result.filtered_count}</p>
                                    <div class="highlighted-text">
                                        ${result.filtered_words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Removed Words (${result.removed_words.length})</h5>
                    <div class="highlighted-text">
                        ${result.removed_words.map(w => `<span class="token-display text-secondary">${w}</span>`).join(' ')}
                    </div>
                `;
                break;
                
            case 'lemmatization':
                // Create a table of changed words
                let changedWords = '';
                for (const [original, lemma] of Object.entries(result.lemma_dict)) {
                    changedWords += `
                        <tr>
                            <td>${original}</td>
                            <td>→</td>
                            <td>${lemma}</td>
                        </tr>
                    `;
                }
                
                html += `
                    <h4>Lemmatization Results</h4>
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Original Text</h5>
                                </div>
                                <div class="card-body">
                                    <div class="highlighted-text">
                                        ${result.original_words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Lemmatized Text</h5>
                                </div>
                                <div class="card-body">
                                    <div class="highlighted-text">
                                        ${result.lemmatized_words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Words Changed (${Object.keys(result.lemma_dict).length})</h5>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Original</th>
                                <th></th>
                                <th>Lemma</th>
                            </tr>
                        </thead>
                        <tbody>${changedWords}</tbody>
                    </table>
                `;
                break;
                
            case 'pos_tagging':
                // Create grouped display
                let posGroups = '';
                for (const [tag, words] of Object.entries(result.pos_groups)) {
                    posGroups += `
                        <div class="mb-3">
                            <h6>${tag}</h6>
                            <div class="highlighted-text">
                                ${words.map(w => `<span class="token-display">${w}</span>`).join(' ')}
                            </div>
                        </div>
                    `;
                }
                
                html += `
                    <h4>Part-of-Speech Tagging Results</h4>
                    <div class="highlighted-text mb-4">
                        ${result.pos_tags.map(pair => 
                            `<span class="token-display" title="${pair[1]}">${pair[0]} <small class="text-muted">(${pair[1]})</small></span>`
                        ).join(' ')}
                    </div>
                    
                    <h5>Grouped by Part of Speech</h5>
                    <div class="pos-groups">
                        ${posGroups}
                    </div>
                `;
                break;
                
            case 'ner':
                // Create a highlighted text with entities
                let textWithEntities = '';
                if (result.entities && result.entities.length > 0) {
                    // Simple approach - display the entities
                    textWithEntities = `
                        <div class="highlighted-text">
                            ${result.entities.map(entity => 
                                `<span class="entity-tag" style="background-color: ${getEntityColor(entity.type)}20; 
                                 color: ${getEntityColor(entity.type)}; border: 1px solid ${getEntityColor(entity.type)}">
                                    ${entity.text} <small>(${entity.type})</small>
                                </span>`
                            ).join(' ')}
                        </div>
                    `;
                } else {
                    textWithEntities = '<p>No entities found in the text.</p>';
                }
                
                // Create entity groups
                let entityGroups = '';
                if (result.entity_groups && Object.keys(result.entity_groups).length > 0) {
                    for (const [type, entities] of Object.entries(result.entity_groups)) {
                        entityGroups += `
                            <div class="mb-3">
                                <h6 style="color: ${getEntityColor(type)}">${type}</h6>
                                <div class="highlighted-text">
                                    ${entities.map(e => 
                                        `<span class="token-display" style="background-color: ${getEntityColor(type)}20; 
                                         color: ${getEntityColor(type)}; border: 1px solid ${getEntityColor(type)}">${e}</span>`
                                    ).join(' ')}
                                </div>
                            </div>
                        `;
                    }
                } else {
                    entityGroups = '<p>No entity groups found.</p>';
                }
                
                html += `
                    <h4>Named Entity Recognition Results</h4>
                    <div class="mb-4">
                        <h5>Identified Entities</h5>
                        ${textWithEntities}
                    </div>
                    
                    <h5>Entities by Type</h5>
                    <div class="entity-groups">
                        ${entityGroups}
                    </div>
                `;
                break;
                
            case 'sentiment_analysis':
                // Get sentiment class for color
                const sentimentClass = getSentimentClass(result.sentiment);
                
                html += `
                    <h4>Sentiment Analysis Results</h4>
                    <div class="card mb-4">
                        <div class="card-body text-center">
                            <h5 class="mb-3">Overall Sentiment</h5>
                            <div class="display-4 ${sentimentClass} mb-3">
                                ${result.sentiment}
                            </div>
                            <div class="d-flex justify-content-around">
                                <div>
                                    <h6>Positive</h6>
                                    <div class="h5 text-success">${(result.scores.pos * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <h6>Neutral</h6>
                                    <div class="h5 text-secondary">${(result.scores.neu * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <h6>Negative</h6>
                                    <div class="h5 text-danger">${(result.scores.neg * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Detailed Scores</h5>
                    <table class="table">
                        <tr>
                            <th>Compound Score</th>
                            <td>${result.scores.compound.toFixed(4)}</td>
                        </tr>
                        <tr>
                            <th>Positive Score</th>
                            <td>${result.scores.pos.toFixed(4)}</td>
                        </tr>
                        <tr>
                            <th>Neutral Score</th>
                            <td>${result.scores.neu.toFixed(4)}</td>
                        </tr>
                        <tr>
                            <th>Negative Score</th>
                            <td>${result.scores.neg.toFixed(4)}</td>
                        </tr>
                    </table>
                `;
                break;
                
            case 'text_summarization':
                // Calculate percentage reduction
                const reductionPercent = ((1 - result.summary_ratio) * 100).toFixed(0);
                
                html += `
                    <h4>Text Summarization Results</h4>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Text reduced by ${reductionPercent}% (from ${result.original_text.length} to ${result.summary.length} characters)
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Original Text</h5>
                                </div>
                                <div class="card-body">
                                    <p>${result.original_text}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-transparent">
                                    <h5 class="mb-0">Summary</h5>
                                </div>
                                <div class="card-body">
                                    <p>${result.summary}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Key Sentences</h5>
                    <div class="list-group">
                        ${result.summary_sentences.map(s => `<div class="list-group-item">${s}</div>`).join('')}
                    </div>
                `;
                break;
                
            case 'keyword_extraction':
                // Create keyword table
                let keywordRows = '';
                result.keywords.forEach((kw, index) => {
                    keywordRows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${kw.word}</td>
                            <td>${kw.score.toFixed(4)}</td>
                        </tr>
                    `;
                });
                
                html += `
                    <h4>Keyword Extraction Results</h4>
                    <p>The following keywords were extracted from the text:</p>
                    
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Keyword</th>
                                <th>Relevance Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${keywordRows}
                        </tbody>
                    </table>
                    
                    <div class="highlighted-text mt-4">
                        ${result.keywords.map(kw => 
                            `<span class="badge bg-primary me-2 mb-2">${kw.word}</span>`
                        ).join('')}
                    </div>
                `;
                break;
                
            case 'text_similarity':
                // Create common terms list
                let commonTermsList = '';
                if (result.common_terms && result.common_terms.length > 0) {
                    commonTermsList = `
                        <div class="highlighted-text">
                            ${result.common_terms.map(term => 
                                `<span class="token-display bg-success bg-opacity-10 text-success border-success">${term}</span>`
                            ).join(' ')}
                        </div>
                    `;
                } else {
                    commonTermsList = '<p>No common terms found.</p>';
                }
                
                html += `
                    <h4>Text Similarity Results</h4>
                    <div class="alert alert-primary">
                        <div class="d-flex align-items-center">
                            <div class="h1 mb-0 me-3">${(result.similarity_score * 100).toFixed(1)}%</div>
                            <div>
                                <h5 class="mb-1">Similarity Score</h5>
                                <p class="mb-0">Based on cosine similarity measure</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card h-100 border-primary border-opacity-25">
                                <div class="card-header bg-primary bg-opacity-10 text-primary">
                                    <h5 class="mb-0">Text 1</h5>
                                </div>
                                <div class="card-body">
                                    <p>${result.text1}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card h-100 border-warning border-opacity-25">
                                <div class="card-header bg-warning bg-opacity-10 text-warning">
                                    <h5 class="mb-0">Text 2</h5>
                                </div>
                                <div class="card-body">
                                    <p>${result.text2}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Common Terms (${result.common_terms ? result.common_terms.length : 0})</h5>
                    ${commonTermsList}
                `;
                break;
                
            case 'language_detection':
                html += `
                    <h4>Language Detection Results</h4>
                    <div class="card mb-4">
                        <div class="card-body text-center">
                            <h5 class="mb-3">Detected Language</h5>
                            <div class="display-4 mb-3">
                                ${result.language_name}
                            </div>
                            <div class="badge bg-primary">${result.language_code}</div>
                        </div>
                    </div>
                    
                    <h5>Language Probabilities</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Language</th>
                                <th>Code</th>
                                <th>Probability</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.all_languages ? result.all_languages.map(lang => `
                                <tr>
                                    <td>${lang.name}</td>
                                    <td>${lang.code}</td>
                                    <td>
                                        <div class="progress">
                                            <div class="progress-bar" role="progressbar" 
                                                style="width: ${lang.prob * 100}%" 
                                                aria-valuenow="${lang.prob * 100}" aria-valuemin="0" aria-valuemax="100">
                                                ${(lang.prob * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : ''}
                        </tbody>
                    </table>
                `;
                break;
                
            default:
                html = '<p>Results not available for this task.</p>';
        }
        
        // Insert HTML and show results
        resultBody.innerHTML = html;
        resultContainer.style.display = 'block';
    }
});
