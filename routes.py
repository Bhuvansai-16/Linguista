import json
from flask import (
    render_template, request, jsonify, Blueprint
)
from config import Config
from utils import (
    validate_text_input,
    process_nlp_task,
    get_code_samples
)
from gemini_utils import (
    ask_gemini,
    explain_code_with_gemini,
    compare_libraries_with_gemini
)
from nlp_utils import get_task_explanation

# Create blueprint
routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    """Render the index page with NLP tools."""
    return render_template('index.html')

@routes.route('/chat')
def chat():
    """Render the chat page with AI assistant."""
    return render_template('chat.html')

@routes.route('/nlp-basics')
def nlp_basics():
    """Render the NLP basics learning page."""
    return render_template('nlp_basics.html')

@routes.route('/code-examples')
def code_examples():
    """Render the code examples page."""
    # Placeholder for future implementation
    return render_template('errors/404.html')

@routes.route('/visualizations')
def visualizations():
    """Render the visualizations page."""
    # Placeholder for future implementation
    return render_template('errors/404.html')

@routes.route('/api/process', methods=['POST'])
def process():
    """Process NLP tasks based on user input."""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request data'}), 400

        # Extract parameters
        task = data.get('task')
        text = data.get('text', '')
        library = data.get('library', Config.DEFAULT_LIBRARY)
        comparison_text = data.get('comparison_text', '')

        # Validate input
        error = validate_text_input(text, task, comparison_text)
        if error:
            return jsonify({'error': error}), 400

        # Process the task
        result, visualization_data = process_nlp_task(task, library, text, comparison_text)

        # Return result
        return jsonify({
            'success': True,
            'result': result,
            'visualization': visualization_data
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@routes.route('/api/sample-text', methods=['GET'])
def get_sample_text():
    """Get sample text for the specified task."""
    task = request.args.get('task', 'tokenization')
    
    if task in Config.SAMPLE_TEXTS:
        sample_text = Config.SAMPLE_TEXTS[task]
        
        # For comparison tasks, also return a second text
        if task == 'text_similarity' and task in Config.TEXT_PAIRS:
            return jsonify({
                'success': True,
                'text': Config.TEXT_PAIRS[task]['text1'],
                'comparison_text': Config.TEXT_PAIRS[task]['text2']
            })
        
        return jsonify({
            'success': True,
            'text': sample_text
        })
    
    return jsonify({
        'success': False,
        'error': 'Sample text not found for the specified task',
        'text': Config.DEFAULT_SAMPLE_TEXT
    })

@routes.route('/api/explanation/<task>', methods=['GET'])
def explanation(task):
    """Get explanation information for the specified NLP task."""
    task_info = get_task_explanation(task)
    
    if task_info:
        return jsonify({
            'success': True,
            'explanation': task_info
        })
    
    return jsonify({
        'success': False,
        'error': 'Explanation not found for the specified task'
    })

@routes.route('/api/code-sample', methods=['GET'])
def code_sample():
    """Get code sample for the specified sample type."""
    sample_type = request.args.get('type', 'nltk-tokenize')
    
    code_samples = get_code_samples()
    if sample_type in code_samples:
        return jsonify({
            'success': True,
            'code': code_samples[sample_type]
        })
    
    return jsonify({
        'success': False,
        'error': 'Code sample not found for the specified type'
    })

@routes.route('/api/chat', methods=['POST'])
def handle_chat():
    """Process chat requests using Gemini API."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        message_type = data.get('type', 'general')
        
        if message_type == 'general':
            question = data.get('message', '')
            if not question:
                return jsonify({'error': 'Message cannot be empty'}), 400
                
            response = ask_gemini(question)
            return jsonify({
                'success': True,
                'response': response
            })
            
        elif message_type == 'code_explanation':
            code = data.get('code', '')
            if not code:
                return jsonify({'error': 'Code cannot be empty'}), 400
                
            response = explain_code_with_gemini(code)
            return jsonify({
                'success': True,
                'response': response
            })
            
        elif message_type == 'library_comparison':
            code = data.get('code', '')
            source_library = data.get('source_library', 'nltk')
            target_library = data.get('target_library', 'spacy')
            include_performance = data.get('include_performance', True)
            
            if not code:
                return jsonify({'error': 'Code cannot be empty'}), 400
                
            response = compare_libraries_with_gemini(
                code, 
                source_library, 
                target_library, 
                include_performance
            )
            
            return jsonify({
                'success': True,
                'response': response
            })
            
        else:
            return jsonify({'error': 'Invalid message type'}), 400
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Error handlers
@routes.app_errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template('errors/404.html'), 404

@routes.app_errorhandler(500)
def server_error(e):
    """Handle 500 errors."""
    return render_template('errors/500.html'), 500