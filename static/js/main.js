/**
 * Main JavaScript for NLP Tools application
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskSelect = document.getElementById('task-select');
    const textInput = document.getElementById('text-input');
    const comparisonContainer = document.getElementById('comparison-container');
    const comparisonText = document.getElementById('comparison-text');
    const processButton = document.getElementById('process-button');
    const showExplanationBtn = document.getElementById('show-explanation');
    const explanationBtnText = document.getElementById('explanation-btn-text');
    const explanationContainer = document.getElementById('explanation-container');
    const resultContainer = document.getElementById('result-container');
    const visualizationContainer = document.getElementById('visualization-container');
    const chartCanvas = document.getElementById('chart-canvas');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorContainer = document.getElementById('error-container');
    const sampleTextBtn = document.getElementById('sample-text-btn');
    
    // Chart instance
    let chart;
    
    // Event Listeners
    
    // Show/hide comparison text input based on task selection
    taskSelect.addEventListener('change', function() {
        const task = this.value;
        
        // Show comparison text input only for text similarity task
        if (task === 'text_similarity') {
            comparisonContainer.style.display = 'block';
        } else {
            comparisonContainer.style.display = 'none';
        }
        
        // Hide result and visualization when task changes
        resultContainer.style.display = 'none';
        visualizationContainer.style.display = 'none';
        
        // Load sample text for the task
        loadSampleText(task);
        
        // Load explanation for the task
        loadTaskExplanation(task);
    });
    
    // Process button click
    processButton.addEventListener('click', function() {
        processNLPTask();
    });
    
    // Sample text button click
    sampleTextBtn.addEventListener('click', function() {
        loadSampleText(taskSelect.value);
    });
    
    // Show/hide explanation
    showExplanationBtn.addEventListener('click', function() {
        if (explanationContainer.style.display === 'none' || !explanationContainer.style.display) {
            explanationContainer.style.display = 'block';
            explanationBtnText.textContent = 'Hide Explanation';
        } else {
            explanationContainer.style.display = 'none';
            explanationBtnText.textContent = 'Show Explanation';
        }
    });
    
    // Auto-expand textarea
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    if (comparisonText) {
        comparisonText.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // Load task explanation on page load
    loadTaskExplanation(taskSelect.value);
    
    // Load sample text on page load
    loadSampleText(taskSelect.value);
    
    // Functions
    
    // Process NLP task
    function processNLPTask() {
        const task = taskSelect.value;
        const text = textInput.value.trim();
        const library = document.querySelector('input[name="library"]:checked').value;
        const comparison = comparisonText ? comparisonText.value.trim() : '';
        
        // Validate input
        if (!text) {
            showError('Please enter text to process.');
            return;
        }
        
        if (task === 'text_similarity' && !comparison) {
            showError('Please enter comparison text for similarity analysis.');
            return;
        }
        
        // Show loading spinner
        showLoading();
        
        // Hide previous results and errors
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        visualizationContainer.style.display = 'none';
        
        // Send API request
        fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: task,
                text: text,
                library: library,
                comparison_text: comparison
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner
            hideLoading();
            
            if (data.error) {
                showError(data.error);
            } else {
                // Display results
                displayResults(data.result, task);
                
                // Display visualization if available
                if (data.visualization) {
                    createVisualization(data.visualization, task);
                    visualizationContainer.style.display = 'block';
                } else {
                    visualizationContainer.style.display = 'none';
                }
            }
        })
        .catch(error => {
            hideLoading();
            showError('An error occurred while processing your request.');
            console.error('Error:', error);
        });
    }
    
    // Load sample text for the selected task
    function loadSampleText(task) {
        fetch(`/api/sample-text?task=${task}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    textInput.value = data.text;
                    
                    // For text similarity, load comparison text too
                    if (task === 'text_similarity' && data.comparison_text) {
                        comparisonText.value = data.comparison_text;
                    }
                    
                    // Update char counter
                    const charCounter = document.getElementById('char-counter');
                    if (charCounter) {
                        charCounter.textContent = data.text.length + ' characters';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading sample text:', error);
            });
    }
    
    // Load task explanation
    function loadTaskExplanation(task) {
        fetch(`/api/explanation/${task}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const explanationBody = explanationContainer.querySelector('.card-body');
                    const template = document.getElementById('task-explanation-template');
                    
                    if (template && explanationBody) {
                        const clone = document.importNode(template.content, true);
                        
                        // Fill in explanation content
                        clone.querySelector('[data-explanation="title"]').textContent = data.explanation.title;
                        clone.querySelector('[data-explanation="what"]').innerHTML = data.explanation.what;
                        clone.querySelector('[data-explanation="why"]').innerHTML = data.explanation.why;
                        clone.querySelector('[data-explanation="how.nltk"]').innerHTML = data.explanation.how.nltk;
                        clone.querySelector('[data-explanation="how.spacy"]').innerHTML = data.explanation.how.spacy;
                        
                        // Clear and append
                        explanationBody.innerHTML = '';
                        explanationBody.appendChild(clone);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading task explanation:', error);
            });
    }
    
    // Display NLP results
    function displayResults(result, task) {
        const resultBody = resultContainer.querySelector('.card-body');
        const template = document.getElementById(`${task}-template`);
        
        if (template && resultBody) {
            const clone = document.importNode(template.content, true);
            
            // Process all elements with data-result attributes
            const resultElements = clone.querySelectorAll('[data-result]');
            resultElements.forEach(element => {
                const resultPath = element.getAttribute('data-result');
                const resultType = element.getAttribute('data-type');
                const resultFormat = element.getAttribute('data-format');
                const resultExclude = element.getAttribute('data-exclude');
                
                // Get the result value from nested path
                const value = getNestedValue(result, resultPath);
                
                if (value !== undefined) {
                    if (resultType === 'array') {
                        renderArray(element, value, task);
                    } else if (resultType === 'dict') {
                        renderDictionary(element, value, resultExclude ? resultExclude.split(',') : []);
                    } else {
                        // Format the value if needed
                        if (resultFormat === 'percent') {
                            element.textContent = (value * 100).toFixed(2) + '%';
                        } else {
                            element.textContent = value;
                        }
                        
                        // Special case for sentiment value to add class
                        if (resultPath === 'sentiment') {
                            element.classList.add(value);
                        }
                    }
                }
            });
            
            // Clear and append
            resultBody.innerHTML = '';
            resultBody.appendChild(clone);
            resultContainer.style.display = 'block';
        }
    }
    
    // Render array values based on element type
    function renderArray(element, array, task) {
        element.innerHTML = '';
        
        if (element.classList.contains('token-display')) {
            array.forEach(item => {
                const token = document.createElement('span');
                token.className = 'token';
                token.textContent = item;
                element.appendChild(token);
            });
        } else if (element.classList.contains('sentence-display')) {
            array.forEach(item => {
                const sentence = document.createElement('div');
                sentence.className = 'sentence';
                sentence.textContent = item;
                element.appendChild(sentence);
            });
        } else if (element.classList.contains('pos-display')) {
            array.forEach(item => {
                const posTag = document.createElement('div');
                posTag.className = 'pos-tag';
                
                const word = document.createElement('span');
                word.className = 'pos-word';
                word.textContent = item[0];
                
                const label = document.createElement('span');
                label.className = 'pos-label';
                label.textContent = item[1];
                
                posTag.appendChild(word);
                posTag.appendChild(label);
                element.appendChild(posTag);
            });
        } else if (element.classList.contains('entity-display')) {
            array.forEach(item => {
                const entityTag = document.createElement('div');
                entityTag.className = 'entity-tag';
                
                const text = document.createElement('span');
                text.className = 'entity-text';
                text.textContent = item.text;
                
                const type = document.createElement('span');
                type.className = 'entity-type';
                type.textContent = item.type;
                
                entityTag.appendChild(text);
                entityTag.appendChild(type);
                element.appendChild(entityTag);
            });
        } else if (element.classList.contains('keyword-display')) {
            array.forEach(item => {
                const keywordItem = document.createElement('div');
                keywordItem.className = 'keyword-item';
                
                const word = document.createElement('div');
                word.className = 'keyword-word';
                word.textContent = item.word;
                
                const score = document.createElement('div');
                score.className = 'keyword-score';
                score.textContent = 'Score: ' + item.score.toFixed(4);
                
                keywordItem.appendChild(word);
                keywordItem.appendChild(score);
                element.appendChild(keywordItem);
            });
        } else if (element.classList.contains('probability-display')) {
            array.forEach(item => {
                const probItem = document.createElement('div');
                probItem.className = 'probability-item';
                
                const lang = document.createElement('div');
                lang.className = 'probability-lang';
                lang.textContent = item.lang;
                
                const value = document.createElement('div');
                value.className = 'probability-value';
                value.textContent = 'Confidence: ' + (item.prob * 100).toFixed(2) + '%';
                
                probItem.appendChild(lang);
                probItem.appendChild(value);
                element.appendChild(probItem);
            });
        }
    }
    
    // Render dictionary values based on element type
    function renderDictionary(element, dict, excludeKeys) {
        element.innerHTML = '';
        
        if (element.classList.contains('lemma-display')) {
            Object.entries(dict).forEach(([original, lemma]) => {
                const lemmaItem = document.createElement('div');
                lemmaItem.className = 'lemma-item';
                
                const originalSpan = document.createElement('span');
                originalSpan.className = 'lemma-original';
                originalSpan.textContent = original;
                
                const arrow = document.createElement('span');
                arrow.className = 'lemma-arrow';
                arrow.innerHTML = '<i class="bi bi-arrow-right"></i>';
                
                const lemmaSpan = document.createElement('span');
                lemmaSpan.className = 'lemma-normalized';
                lemmaSpan.textContent = lemma;
                
                lemmaItem.appendChild(originalSpan);
                lemmaItem.appendChild(arrow);
                lemmaItem.appendChild(lemmaSpan);
                element.appendChild(lemmaItem);
            });
        } else if (element.classList.contains('pos-groups-display')) {
            Object.entries(dict).forEach(([tag, words]) => {
                const posGroup = document.createElement('div');
                posGroup.className = 'pos-group';
                
                const header = document.createElement('div');
                header.className = 'pos-group-header';
                header.textContent = tag;
                
                const wordsContainer = document.createElement('div');
                wordsContainer.className = 'token-display';
                
                words.forEach(word => {
                    const token = document.createElement('span');
                    token.className = 'token';
                    token.textContent = word;
                    wordsContainer.appendChild(token);
                });
                
                posGroup.appendChild(header);
                posGroup.appendChild(wordsContainer);
                element.appendChild(posGroup);
            });
        } else if (element.classList.contains('entity-groups-display')) {
            Object.entries(dict).forEach(([type, entities]) => {
                const entityGroup = document.createElement('div');
                entityGroup.className = 'entity-group';
                
                const header = document.createElement('div');
                header.className = 'entity-group-header';
                header.textContent = type;
                
                const entitiesContainer = document.createElement('div');
                entitiesContainer.className = 'token-display';
                
                entities.forEach(entity => {
                    const token = document.createElement('span');
                    token.className = 'token';
                    token.textContent = entity;
                    entitiesContainer.appendChild(token);
                });
                
                entityGroup.appendChild(header);
                entityGroup.appendChild(entitiesContainer);
                element.appendChild(entityGroup);
            });
        } else if (element.classList.contains('score-display')) {
            Object.entries(dict).forEach(([key, value]) => {
                // Skip excluded keys
                if (excludeKeys.includes(key)) return;
                
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                
                const label = document.createElement('div');
                label.className = 'score-label';
                label.textContent = key;
                
                const scoreValue = document.createElement('div');
                scoreValue.className = 'score-value';
                scoreValue.textContent = value.toFixed(4);
                
                scoreItem.appendChild(label);
                scoreItem.appendChild(scoreValue);
                element.appendChild(scoreItem);
            });
        }
    }
    
    // Create visualization based on task
    function createVisualization(data, task) {
        // Destroy previous chart if exists
        if (chart) {
            chart.destroy();
        }
        
        // Create chart based on task
        if (task === 'sentiment_analysis') {
            createSentimentChart(data);
        } else if (task === 'keyword_extraction') {
            createKeywordChart(data);
        }
    }
    
    // Create sentiment analysis chart
    function createSentimentChart(data) {
        const ctx = chartCanvas.getContext('2d');
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Sentiment Score',
                    data: data.map(item => item.value),
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',  // Positive - green
                        'rgba(108, 117, 125, 0.7)', // Neutral - gray
                        'rgba(220, 53, 69, 0.7)'   // Negative - red
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(108, 117, 125, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return (value * 100) + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + (context.raw * 100).toFixed(2) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Create keyword extraction chart
    function createKeywordChart(data) {
        const ctx = chartCanvas.getContext('2d');
        
        // Sort data by value in descending order
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        
        // Take only top 10 keywords
        const topData = sortedData.slice(0, 10);
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topData.map(item => item.name),
                datasets: [{
                    label: 'Keyword Score',
                    data: topData.map(item => item.value),
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Helper function to get nested object value by path
    function getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => 
            prev && prev[curr] !== undefined ? prev[curr] : undefined, obj);
    }
    
    // Show error message
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    // Show loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'block';
    }
    
    // Hide loading spinner
    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }
});