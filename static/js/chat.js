/**
 * JavaScript for the chat functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const generalChatForm = document.getElementById('general-chat-form');
    const codeExplanationForm = document.getElementById('code-explanation-form');
    const compareLibrariesForm = document.getElementById('compare-libraries-form');
    const chatInput = document.getElementById('chat-input');
    const codeTextarea = document.getElementById('code-textarea');
    const compareTextarea = document.getElementById('compare-textarea');
    const sourceLibrary = document.getElementById('source-library');
    const targetLibrary = document.getElementById('target-library');
    const includePerformance = document.getElementById('include-performance');
    const codeSampleSelect = document.getElementById('code-sample-select');
    const exampleButtons = document.querySelectorAll('.example-question-btn');
    
    // Tab elements
    const tabs = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
    
    // Form visibility manager
    function updateFormVisibility(activeTabId) {
        generalChatForm.style.display = activeTabId === 'general-tab' ? 'block' : 'none';
        codeExplanationForm.style.display = activeTabId === 'code-tab' ? 'block' : 'none';
        compareLibrariesForm.style.display = activeTabId === 'compare-tab' ? 'block' : 'none';
    }
    
    // Initialize - Show general chat form by default
    updateFormVisibility('general-tab');
    
    // Event Listeners
    
    // Tab change listener
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            updateFormVisibility(event.target.id);
        });
    });
    
    // General chat form submission
    generalChatForm.addEventListener('submit', handleGeneralChat);
    
    // Code explanation form submission
    codeExplanationForm.addEventListener('submit', handleCodeExplanation);
    
    // Code comparison form submission
    compareLibrariesForm.addEventListener('submit', handleCompareLibraries);
    
    // Example question buttons
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            chatInput.value = this.textContent.trim();
            
            // Trigger submit if on general tab
            if (document.querySelector('#general-tab').classList.contains('active')) {
                setTimeout(() => generalChatForm.dispatchEvent(new Event('submit')), 100);
            }
        });
    });
    
    // Textarea auto-resize
    const autoResizeTextarea = function(element) {
        if (element) {
            element.style.height = 'auto';
            element.style.height = (element.scrollHeight) + 'px';
        }
    };
    
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
    }
    
    // Code sample selection
    if (codeSampleSelect) {
        codeSampleSelect.addEventListener('change', function() {
            if (this.value) {
                fetch(`/api/code-sample?type=${this.value}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && codeTextarea) {
                            codeTextarea.value = data.code;
                            autoResizeTextarea(codeTextarea);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading code sample:', error);
                    });
            }
        });
    }
    
    // Handler Functions
    
    // Handle general chat form submission
    function handleGeneralChat(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(chatMessages, message, 'user');
        
        // Clear input
        chatInput.value = '';
        autoResizeTextarea(chatInput);
        
        // Add thinking message
        const thinkingId = addThinkingMessage(chatMessages);
        
        // Send to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'general',
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            if (data.error) {
                addErrorMessage(chatMessages, data.error);
            } else {
                addMessage(chatMessages, data.response, 'system');
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            addErrorMessage(chatMessages, 'An error occurred while sending your message.');
            console.error('Error:', error);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // Handle code explanation form submission
    function handleCodeExplanation(e) {
        e.preventDefault();
        
        const code = codeTextarea.value.trim();
        if (!code) {
            addErrorMessage(chatMessages, 'Please enter code to explain.');
            return;
        }
        
        // Add user code block to chat
        addCodeBlockMessage(chatMessages, code, 'user');
        
        // Add thinking message
        const thinkingId = addThinkingMessage(chatMessages);
        
        // Send to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'code_explanation',
                code: code
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            if (data.error) {
                addErrorMessage(chatMessages, data.error);
            } else {
                addMessage(chatMessages, data.response, 'system');
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            addErrorMessage(chatMessages, 'An error occurred while explaining the code.');
            console.error('Error:', error);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // Handle library comparison form submission
    function handleCompareLibraries(e) {
        e.preventDefault();
        
        const code = compareTextarea.value.trim();
        const source = sourceLibrary.value;
        const target = targetLibrary.value;
        const includePerf = includePerformance.checked;
        
        if (!code) {
            addErrorMessage(chatMessages, 'Please enter code to compare.');
            return;
        }
        
        // Add user code block to chat with description
        const userMessage = `Please convert this ${source} code to ${target}:`;
        addMessage(chatMessages, userMessage, 'user');
        addCodeBlockMessage(chatMessages, code, 'user');
        
        // Add thinking message
        const thinkingId = addThinkingMessage(chatMessages);
        
        // Send to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'library_comparison',
                code: code,
                source_library: source,
                target_library: target,
                include_performance: includePerf
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            if (data.error) {
                addErrorMessage(chatMessages, data.error);
            } else {
                addMessage(chatMessages, data.response, 'system');
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            // Remove thinking message
            removeThinkingMessage(thinkingId);
            
            addErrorMessage(chatMessages, 'An error occurred while comparing libraries.');
            console.error('Error:', error);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // Message Helper Functions
    
    // Add regular message to chat
    function addMessage(container, message, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header d-flex align-items-center';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user') {
            avatar.innerHTML = '<i class="bi bi-person"></i>';
        } else {
            avatar.innerHTML = '<i class="bi bi-robot"></i>';
        }
        
        const senderName = document.createElement('div');
        senderName.className = 'message-sender';
        senderName.textContent = sender === 'user' ? 'You' : 'Linguista';
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(senderName);
        
        const messageBody = document.createElement('div');
        messageBody.className = 'message-body';
        
        // Process markdown
        const processedMessage = processMarkdown(message);
        messageBody.innerHTML = processedMessage;
        
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageBody);
        messageWrapper.appendChild(messageContent);
        
        container.appendChild(messageWrapper);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    // Add code block message to chat
    function addCodeBlockMessage(container, code, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header d-flex align-items-center';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user') {
            avatar.innerHTML = '<i class="bi bi-person"></i>';
        } else {
            avatar.innerHTML = '<i class="bi bi-robot"></i>';
        }
        
        const senderName = document.createElement('div');
        senderName.className = 'message-sender';
        senderName.textContent = sender === 'user' ? 'You' : 'Linguista';
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(senderName);
        
        const messageBody = document.createElement('div');
        messageBody.className = 'message-body';
        
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';
        
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        codeHeader.innerHTML = '<span class="code-language">Python</span>';
        
        const codeContent = document.createElement('div');
        codeContent.className = 'code-content';
        
        const pre = document.createElement('pre');
        pre.className = 'mb-0';
        
        const codeElement = document.createElement('code');
        codeElement.className = 'language-python';
        codeElement.textContent = code;
        
        pre.appendChild(codeElement);
        codeContent.appendChild(pre);
        codeBlock.appendChild(codeHeader);
        codeBlock.appendChild(codeContent);
        
        messageBody.appendChild(codeBlock);
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageBody);
        messageWrapper.appendChild(messageContent);
        
        container.appendChild(messageWrapper);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    // Add thinking message (spinner)
    function addThinkingMessage(container) {
        const id = 'thinking-' + Date.now();
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper system-message';
        messageWrapper.id = id;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header d-flex align-items-center';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="bi bi-robot"></i>';
        
        const senderName = document.createElement('div');
        senderName.className = 'message-sender';
        senderName.textContent = 'Linguista';
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(senderName);
        
        const messageBody = document.createElement('div');
        messageBody.className = 'message-body';
        
        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'thinking-message';
        
        const thinkingText = document.createElement('span');
        thinkingText.textContent = 'Thinking';
        
        const thinkingDots = document.createElement('div');
        thinkingDots.className = 'thinking-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'thinking-dot';
            thinkingDots.appendChild(dot);
        }
        
        thinkingMessage.appendChild(thinkingText);
        thinkingMessage.appendChild(thinkingDots);
        
        messageBody.appendChild(thinkingMessage);
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageBody);
        messageWrapper.appendChild(messageContent);
        
        container.appendChild(messageWrapper);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        return id;
    }
    
    // Remove thinking message
    function removeThinkingMessage(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }
    
    // Add error message
    function addErrorMessage(container, errorText) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper system-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header d-flex align-items-center';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="bi bi-robot"></i>';
        
        const senderName = document.createElement('div');
        senderName.className = 'message-sender';
        senderName.textContent = 'Linguista';
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(senderName);
        
        const messageBody = document.createElement('div');
        messageBody.className = 'message-body';
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger mb-0';
        errorMessage.textContent = errorText;
        
        messageBody.appendChild(errorMessage);
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageBody);
        messageWrapper.appendChild(messageContent);
        
        container.appendChild(messageWrapper);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    // Process markdown in messages (simple version)
    function processMarkdown(text) {
        if (!text) return '';
        
        // Handle code blocks
        text = text.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
            const lang = language || 'text';
            return `<div class="code-block">
                        <div class="code-header">
                            <span class="code-language">${lang}</span>
                        </div>
                        <div class="code-content">
                            <pre class="mb-0"><code class="language-${lang}">${code.trim()}</code></pre>
                        </div>
                    </div>`;
        });
        
        // Handle inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle lists
        text = text.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Handle ordered lists
        text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
        
        // Handle headers
        text = text.replace(/^### (.+)$/gm, '<h5>$1</h5>');
        text = text.replace(/^## (.+)$/gm, '<h4>$1</h4>');
        text = text.replace(/^# (.+)$/gm, '<h3>$1</h3>');
        
        // Handle paragraphs (replace double line breaks with paragraph tags)
        text = text.replace(/\n\s*\n/g, '</p><p>');
        text = '<p>' + text + '</p>';
        
        return text;
    }
});