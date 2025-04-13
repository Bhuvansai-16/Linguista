/**
 * JavaScript for the chat functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - General Chat
    const generalChatForm = document.getElementById('general-chat-form');
    const generalInput = document.getElementById('general-input');
    const generalMessages = document.getElementById('general-messages');
    
    // DOM Elements - Code Explanation
    const codeChatForm = document.getElementById('code-chat-form');
    const codeInput = document.getElementById('code-input');
    const codeMessages = document.getElementById('code-messages');
    
    // DOM Elements - Compare Libraries
    const compareChatForm = document.getElementById('compare-chat-form');
    const compareCodeInput = document.getElementById('compare-code-input');
    const sourceLibrary = document.getElementById('source-library');
    const targetLibrary = document.getElementById('target-library');
    const performanceComparison = document.getElementById('performance-comparison');
    const compareMessages = document.getElementById('compare-messages');
    
    // DOM Elements - Suggestion Chips
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    // DOM Elements - Code Samples
    const codeSamples = document.querySelectorAll('.code-sample');
    
    // Add event listeners
    if (generalChatForm) {
        generalChatForm.addEventListener('submit', handleGeneralChat);
    }
    
    if (codeChatForm) {
        codeChatForm.addEventListener('submit', handleCodeExplanation);
    }
    
    if (compareChatForm) {
        compareChatForm.addEventListener('submit', handleCompareLibraries);
    }
    
    // Handle suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            if (text && generalInput) {
                generalInput.value = text;
                generalInput.focus();
            }
        });
    });
    
    // Handle code samples
    codeSamples.forEach(sample => {
        sample.addEventListener('click', function() {
            const sampleType = this.getAttribute('data-sample');
            if (sampleType && codeInput) {
                // Fetch code sample from server
                fetch(`/api/code-sample?type=${sampleType}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch code sample');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.code) {
                            codeInput.value = data.code;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching code sample:', error);
                        alert('Failed to load code sample');
                    });
            }
        });
    });
    
    // Handle general chat form submission
    function handleGeneralChat(e) {
        e.preventDefault();
        
        const message = generalInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(generalMessages, message, 'user');
        
        // Clear input
        generalInput.value = '';
        
        // Show thinking message
        const thinkingId = addThinkingMessage(generalMessages);
        
        // Send message to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                type: 'general'
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add bot response
            addMessage(generalMessages, data.response, 'bot');
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add error message
            addErrorMessage(generalMessages, error.message || 'An error occurred. Please try again.');
        });
    }
    
    // Handle code explanation form submission
    function handleCodeExplanation(e) {
        e.preventDefault();
        
        const code = codeInput.value.trim();
        if (!code) {
            alert('Please enter some code to explain');
            return;
        }
        
        // Add user message to chat
        addCodeBlockMessage(codeMessages, code, 'user');
        
        // Show thinking message
        const thinkingId = addThinkingMessage(codeMessages);
        
        // Send code to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: code,
                type: 'code'
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add bot response
            addMessage(codeMessages, data.response, 'bot');
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add error message
            addErrorMessage(codeMessages, error.message || 'An error occurred. Please try again.');
        });
    }
    
    // Handle compare libraries form submission
    function handleCompareLibraries(e) {
        e.preventDefault();
        
        const code = compareCodeInput.value.trim();
        const source = sourceLibrary.value;
        const target = targetLibrary.value;
        const includePerformance = performanceComparison.checked;
        
        if (!code) {
            alert('Please enter some code to compare');
            return;
        }
        
        // Validate source and target are different
        if (source === target) {
            alert('Source and target libraries must be different');
            return;
        }
        
        // Add user message to chat
        const userMessage = `Compare ${source} to ${target}:\n\n${code}`;
        addCodeBlockMessage(compareMessages, userMessage, 'user');
        
        // Show thinking message
        const thinkingId = addThinkingMessage(compareMessages);
        
        // Send comparison request to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'compare',
                code: code,
                source_library: source,
                target_library: target,
                include_performance: includePerformance
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add bot response
            addMessage(compareMessages, data.response, 'bot');
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            // Add error message
            addErrorMessage(compareMessages, error.message || 'An error occurred. Please try again.');
        });
    }
    
    // Helper to add a message to the chat
    function addMessage(container, message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="bi bi-person"></i>' : '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Process markdown in bot messages
        if (sender === 'bot') {
            // Simple markdown processing (could use a library like marked.js for better support)
            let formattedMessage = message
                // Code blocks (```code```)
                .replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
                // Inline code (`code`)
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                // Bold (**text**)
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                // Italic (*text*)
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                // Headers (## Header)
                .replace(/^## (.*$)/gm, '<h3>$1</h3>')
                .replace(/^# (.*$)/gm, '<h2>$1</h2>')
                // Lists
                .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
                .replace(/^\s*\*\s+(.*$)/gm, '<li>$1</li>')
                // Paragraphs
                .replace(/\n\n/g, '</p><p>');
                
            contentDiv.innerHTML = `<p>${formattedMessage}</p>`;
            
            // Convert consecutive list items to proper lists
            const contentHtml = contentDiv.innerHTML;
            contentDiv.innerHTML = contentHtml
                .replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)+/g, function(match) {
                    return `<ul>${match}</ul>`;
                });
        } else {
            // For user messages, simple text with line breaks
            contentDiv.textContent = message;
        }
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = 'Just now';
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    // Helper to add a code block message
    function addCodeBlockMessage(container, code, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="bi bi-person"></i>' : '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Format as code block
        const codeBlock = document.createElement('pre');
        codeBlock.className = 'code-block';
        codeBlock.textContent = code;
        
        contentDiv.appendChild(codeBlock);
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = 'Just now';
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    // Helper to add a thinking message
    function addThinkingMessage(container) {
        const id = 'thinking-' + Date.now();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.id = id;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span>Thinking...</span>
            </div>
        `;
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = 'Just now';
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        return id;
    }
    
    // Helper to remove thinking message
    function removeThinkingMessage(id) {
        const messageDiv = document.getElementById(id);
        if (messageDiv) {
            messageDiv.remove();
        }
    }
    
    // Helper to add an error message
    function addErrorMessage(container, errorText) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="alert alert-danger mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${errorText}
            </div>
        `;
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = 'Just now';
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
});
