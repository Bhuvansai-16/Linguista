import os
import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Gemini API
def initialize_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("No GEMINI_API_KEY found. Gemini features will not work.")
        return False
    
    try:
        genai.configure(api_key=api_key)
        logger.info("Gemini API initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {str(e)}")
        return False

# Generate response from Gemini
def get_gemini_response(prompt, model_name="models/gemini-1.5-pro"):
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating Gemini response: {str(e)}")
        return f"Sorry, I couldn't generate a response due to an error: {str(e)}"

# NLP expert prompt template
def create_nlp_expert_prompt(user_query):
    return f"""
    You are an expert in Natural Language Processing (NLP), specializing in both NLTK and spaCy libraries.
    Provide a helpful, educational response to the following question about NLP concepts, techniques, or implementation:
    
    Question: {user_query}
    
    Include the following in your response:
    1. A clear, concise explanation of the NLP concept
    2. How it's implemented in both NLTK and spaCy (if applicable)
    3. A code example if relevant
    4. Best practices or common pitfalls
    5. References to further learning resources
    
    Keep your response educational and helpful for someone learning NLP.
    """

# Code explanation prompt template
def create_code_explanation_prompt(code_snippet, language="python"):
    return f"""
    As an NLP expert, explain the following {language} code that uses NLP libraries (such as NLTK, spaCy, etc.):
    
    ```{language}
    {code_snippet}
    ```
    
    Please include:
    1. The purpose of this code
    2. Explanation of key NLP concepts used
    3. How the libraries are being utilized
    4. Potential improvements or best practices
    5. Any potential issues or limitations
    
    Format your response to be educational and helpful for someone learning NLP.
    """

# Generate similar code in alternative library
def create_code_alternative_prompt(code_snippet, source_library, target_library):
    return f"""
    Convert the following {source_library} code to equivalent {target_library} code:
    
    ```python
    {code_snippet}
    ```
    
    Please provide:
    1. The equivalent code in {target_library}
    2. A comparison of the approaches
    3. Any advantages or disadvantages of each implementation
    4. Implementation notes for someone new to {target_library}
    
    Format your response to be educational and helpful for someone learning NLP.
    """