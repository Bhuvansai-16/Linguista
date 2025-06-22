import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const nlpAPI = {
  // Process NLP tasks
  processText: async (data) => {
    const response = await api.post('/api/process', data);
    return response.data;
  },

  // Get sample text for tasks
  getSampleText: async (task) => {
    const response = await api.get(`/api/sample-text?task=${task}`);
    return response.data;
  },

  // Get task explanations
  getExplanation: async (task) => {
    const response = await api.get(`/api/explanation/${task}`);
    return response.data;
  },

  // Get code samples
  getCodeSample: async (type) => {
    const response = await api.get(`/api/code-sample?type=${type}`);
    return response.data;
  },

  // Chat with AI
  chat: async (data) => {
    const response = await api.post('/api/chat', data);
    return response.data;
  },

  // Generate learning content
  generateLearningContent: async (data) => {
    const response = await api.post('/api/generate-learning-content', data);
    return response.data;
  }
};

export default api;