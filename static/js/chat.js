/**
 * JavaScript for the chat functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const generalChatForm = document.getElementById('general-chat-form');
    const chatInput = document.getElementById('chat-input');

    // Initialize chat
    if (generalChatForm) {
        generalChatForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message to chat
            addMessage(message, 'user');

            // Clear input
            chatInput.value = '';

            // Add thinking message
            const thinkingId = addThinkingMessage();

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
                    addErrorMessage(data.error);
                } else {
                    addMessage(data.response, 'system');
                }

                // Scroll to bottom
                scrollToBottom();
            })
            .catch(error => {
                // Remove thinking message
                removeThinkingMessage(thinkingId);
                addErrorMessage('An error occurred while sending your message.');
                console.error('Error:', error);
                scrollToBottom();
            });
        });
    }

    // Helper functions
    function addMessage(message, sender) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${sender}-message`;

        wrapper.innerHTML = `
            <div class="message-content">
                <div class="message-header d-flex align-items-center">
                    <div class="message-avatar">
                        <i class="bi bi-${sender === 'user' ? 'person' : 'robot'}"></i>
                    </div>
                    <div class="message-sender">${sender === 'user' ? 'You' : 'Linguista'}</div>
                </div>
                <div class="message-body">${message}</div>
            </div>
        `;

        chatMessages.appendChild(wrapper);
        scrollToBottom();
    }

    function addThinkingMessage() {
        const id = 'thinking-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper system-message';
        wrapper.id = id;

        wrapper.innerHTML = `
            <div class="message-content">
                <div class="message-header d-flex align-items-center">
                    <div class="message-avatar">
                        <i class="bi bi-robot"></i>
                    </div>
                    <div class="message-sender">Linguista</div>
                </div>
                <div class="message-body">
                    <div class="thinking-message">
                        <span>Thinking</span>
                        <div class="thinking-dots">
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(wrapper);
        scrollToBottom();
        return id;
    }

    function removeThinkingMessage(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    function addErrorMessage(error) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper system-message';

        wrapper.innerHTML = `
            <div class="message-content">
                <div class="message-header d-flex align-items-center">
                    <div class="message-avatar">
                        <i class="bi bi-robot"></i>
                    </div>
                    <div class="message-sender">Linguista</div>
                </div>
                <div class="message-body">
                    <div class="alert alert-danger mb-0">${error}</div>
                </div>
            </div>
        `;

        chatMessages.appendChild(wrapper);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});