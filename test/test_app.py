import unittest
import json
from app import app
from unittest.mock import patch

class TestNLPApp(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        
    def test_index_route(self):
        """Test the index route returns successful response"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'NLP Tools', response.data)
        
    def test_chat_route(self):
        """Test the chat route returns successful response"""
        response = self.client.get('/chat')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'NLP Expert Assistant', response.data)
        
    def test_explanation_route(self):
        """Test the explanation route returns correct data"""
        response = self.client.get('/explanation/tokenization')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Tokenization')
        self.assertIn('what', data)
        self.assertIn('why', data)
        self.assertIn('how', data)
        
    def test_sample_text_route(self):
        """Test the sample text route returns text for different tasks"""
        response = self.client.get('/api/sample-text?task=tokenization')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('text', data)
        self.assertTrue(len(data['text']) > 0)
        
        # Test text similarity which should include comparison text
        response = self.client.get('/api/sample-text?task=text_similarity')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('text', data)
        self.assertIn('comparison_text', data)
        self.assertTrue(len(data['comparison_text']) > 0)
        
    def test_code_sample_route(self):
        """Test the code sample route returns code for sample types"""
        response = self.client.get('/api/code-sample?type=nltk-tokenize')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('code', data)
        self.assertIn('NLTK tokenization', data['code'])
        
        # Test invalid sample type
        response = self.client.get('/api/code-sample?type=invalid-sample')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    @patch('utils.perform_tokenization')
    def test_process_tokenization(self, mock_perform_tokenization):
        """Test the process endpoint with tokenization task"""
        # Mock the tokenization function
        mock_result = {
            'words': ['hello', 'world'],
            'sentences': ['hello world'],
            'word_count': 2,
            'sentence_count': 1
        }
        mock_perform_tokenization.return_value = mock_result
        
        response = self.client.post('/api/process', 
                                   json={
                                       'task': 'tokenization',
                                       'library': 'nltk',
                                       'text': 'hello world'
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['result']['word_count'], 2)
        
    def test_process_validation_error(self):
        """Test validation errors in process endpoint"""
        # Test empty text
        response = self.client.post('/api/process', 
                                   json={
                                       'task': 'tokenization',
                                       'library': 'nltk',
                                       'text': ''
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('empty', data['error'].lower())
        
        # Test text too short
        response = self.client.post('/api/process', 
                                   json={
                                       'task': 'tokenization',
                                       'library': 'nltk',
                                       'text': 'hi'
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('3 characters', data['error'])
        
        # Test missing comparison text for text similarity
        response = self.client.post('/api/process', 
                                   json={
                                       'task': 'text_similarity',
                                       'library': 'nltk',
                                       'text': 'This is a test sentence',
                                       'comparison_text': ''
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('comparison text', data['error'].lower())
        
    @patch('gemini_utils.ask_gemini')
    def test_chat_endpoint(self, mock_ask_gemini):
        """Test the chat endpoint"""
        mock_ask_gemini.return_value = "This is a test response from Gemini"
        
        response = self.client.post('/api/chat', 
                                   json={
                                       'message': 'What is NLP?',
                                       'type': 'general'
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('response', data)
        self.assertEqual(data['response'], "This is a test response from Gemini")
        
        # Test empty message
        response = self.client.post('/api/chat', 
                                   json={
                                       'message': '',
                                       'type': 'general'
                                   },
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('empty', data['error'].lower())
        
    def test_error_pages(self):
        """Test error pages are handled correctly"""
        # Test 404 error
        response = self.client.get('/non-existent-page')
        self.assertEqual(response.status_code, 404)
        self.assertIn(b'Error', response.data)
        self.assertIn(b'Page not found', response.data)
        
if __name__ == '__main__':
    unittest.main()
