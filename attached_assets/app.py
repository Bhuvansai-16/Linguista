import os
import logging
import json
from flask import Flask, render_template, request, jsonify
from nlp_utils import (
    perform_tokenization, 
    perform_stopword_removal, 
    perform_lemmatization, 
    perform_pos_tagging, 
    perform_ner, 
    perform_sentiment_analysis, 
    perform_text_summarization, 
    perform_keyword_extraction,
    perform_text_similarity,
    perform_language_detection,
    get_task_explanation
)
from gemini_utils import (
    initialize_gemini,
    get_gemini_response,
    create_nlp_expert_prompt,
    create_code_explanation_prompt,
    create_code_alternative_prompt
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "nlp-educational-app-default-key")

# Initialize Gemini API
gemini_available = initialize_gemini()
logger.info(f"Gemini API initialized and available: {gemini_available}")

# Define routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/process', methods=['POST'])
def process_text():
    data = request.get_json()
    text = data.get('text', '')
    task = data.get('task', '')
    library = data.get('library', 'nltk')  # Default to NLTK if not specified
    
    if not text:
        return jsonify({
            'error': 'No text provided',
            'result': None,
            'explanation': None
        })
    
    # Process text based on the selected task
    try:
        if not text or len(text.strip()) == 0:
            return jsonify({
                'error': 'Please enter some text to process',
                'result': None,
                'explanation': None
            })

        result = None
        visual_data = None
        
        if task == 'tokenization':
            result = perform_tokenization(text, library)
        elif task == 'stopword_removal':
            result = perform_stopword_removal(text, library)
        elif task == 'lemmatization':
            result = perform_lemmatization(text, library)
        elif task == 'pos_tagging':
            result = perform_pos_tagging(text, library)
        elif task == 'ner':
            result = perform_ner(text, library)
        elif task == 'sentiment_analysis':
            result, visual_data = perform_sentiment_analysis(text, library)
        elif task == 'text_summarization':
            result = perform_text_summarization(text, library)
        elif task == 'keyword_extraction':
            result, visual_data = perform_keyword_extraction(text, library)
        elif task == 'text_similarity':
            comparison_text = data.get('comparison_text', '')
            if not comparison_text:
                return jsonify({
                    'error': 'Comparison text is required for text similarity',
                    'result': None,
                    'explanation': None
                })
            result, visual_data = perform_text_similarity(text, comparison_text, library)
        elif task == 'language_detection':
            result = perform_language_detection(text, library)
        else:
            return jsonify({
                'error': f'Unknown task: {task}',
                'result': None,
                'explanation': None
            })

        if result is None:
            raise ValueError('Processing resulted in no output')
        
        # Get explanation for the task
        explanation = get_task_explanation(task)
        
        return jsonify({
            'result': result,
            'visual_data': visual_data,
            'explanation': explanation
        })
    
    except ValueError as e:
        logging.error(f"Value error in {task}: {str(e)}")
        return jsonify({
            'error': f'Invalid input: {str(e)}',
            'result': None,
            'explanation': None
        }), 400
    except Exception as e:
        logging.error(f"Error processing {task}: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred while processing your text. Please try again.',
            'result': None,
            'explanation': None
        }), 500

@app.route('/explanation/<task>')
def get_explanation(task):
    explanation = get_task_explanation(task)
    return jsonify(explanation)

# Gemini API chat routes
@app.route('/chat/ask', methods=['POST'])
def chat_ask():
    if not gemini_available:
        return jsonify({
            'error': 'Gemini API is not available. Please check your API key.'
        })
    
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'No query provided'})
    
    try:
        # Create the prompt for the Gemini API
        prompt = create_nlp_expert_prompt(query)
        
        # Get response from Gemini
        response = get_gemini_response(prompt)
        
        return jsonify({'response': response})
    
    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}")
        return jsonify({'error': f'Error generating response: {str(e)}'})

@app.route('/chat/explain-code', methods=['POST'])
def explain_code():
    if not gemini_available:
        return jsonify({
            'error': 'Gemini API is not available. Please check your API key.'
        })
    
    data = request.get_json()
    code = data.get('code', '')
    
    if not code:
        return jsonify({'error': 'No code provided'})
    
    try:
        # Create the prompt for the Gemini API
        prompt = create_code_explanation_prompt(code)
        
        # Get explanation from Gemini
        explanation = get_gemini_response(prompt)
        
        return jsonify({'explanation': explanation})
    
    except Exception as e:
        logger.error(f"Error explaining code: {str(e)}")
        return jsonify({'error': f'Error explaining code: {str(e)}'})

@app.route('/chat/compare-code', methods=['POST'])
def compare_code():
    if not gemini_available:
        return jsonify({
            'error': 'Gemini API is not available. Please check your API key.'
        })
    
    data = request.get_json()
    code = data.get('code', '')
    source_library = data.get('source_library', '')
    target_library = data.get('target_library', '')
    
    if not code:
        return jsonify({'error': 'No code provided'})
    
    if not source_library or not target_library:
        return jsonify({'error': 'Source and target libraries must be specified'})
    
    try:
        # Create the prompt for the Gemini API
        prompt = create_code_alternative_prompt(code, source_library, target_library)
        
        # Get comparison from Gemini
        comparison = get_gemini_response(prompt)
        
        return jsonify({'comparison': comparison})
    
    except Exception as e:
        logger.error(f"Error comparing code: {str(e)}")
        return jsonify({'error': f'Error comparing code: {str(e)}'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
