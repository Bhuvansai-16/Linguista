import logging
import traceback
from config import Config
import google.generativeai as genai
import os

GEMINI_API_KEY = os.environ['GEMINI_API_KEY']
# Setup logger
logger = logging.getLogger(__name__)


# Initialize Gemini
def initialize_gemini():
    """Initialize the Gemini API client."""
    try:
        api_key = Config.GEMINI_API_KEY
        if not api_key:
            logger.warning(
                "GEMINI_API_KEY not found in environment variables. Gemini features will not work."
            )
            return False

        genai.configure(api_key=api_key)
        return True
    except Exception as e:
        logger.error(f"Error initializing Gemini: {str(e)}")
        return False


# Initialize Gemini when module is loaded
gemini_available = initialize_gemini()


def create_gemini_prompt(prompt_type, **kwargs):
    """
    Create a structured prompt for Gemini based on the prompt type.
    
    Args:
        prompt_type (str): Type of prompt (general, code_explanation, library_comparison)
        **kwargs: Additional arguments for specific prompt types
        
    Returns:
        str: Formatted prompt for Gemini
    """
    if prompt_type == "general":
        question = kwargs.get("question", "")
        return f"""You are an NLP trainer helping a user understand natural language processing concepts and techniques.
        
Question: {question}

Provide a concise, educational response with these characteristics:
1. Keep explanations short and to the point (4-5 sentences maximum)
2. Include a simple, concrete example that illustrates the concept
3. Use simple language and avoid jargon when possible
4. Format your response with markdown for better readability
5. If applicable, include a brief code snippet to demonstrate the concept

If the question isn't about NLP or is inappropriate, politely redirect to an NLP-related topic.
"""

    elif prompt_type == "code_explanation":
        code = kwargs.get("code", "")
        return f"""You are an NLP trainer analyzing code. Explain the following NLP-related code:

```python
{code}
```

Provide a concise explanation with these characteristics:
1. Start with a 1-2 sentence summary of what the code does
2. Explain key NLP concepts demonstrated in the code (max 3-4 bullet points)
3. Use simple language that a beginner could understand
4. Include a brief example of how the code would process a specific input
5. If there are any best practices or common pitfalls, mention them briefly

Use markdown formatting for clarity. If the code is not NLP-related, explain this politely and offer to help with NLP code instead.
"""

    elif prompt_type == "library_comparison":
        code = kwargs.get("code", "")
        source_lib = kwargs.get("source_library", "nltk")
        target_lib = kwargs.get("target_library", "spacy")
        include_performance = kwargs.get("include_performance", True)

        performance_section = ""
        if include_performance:
            performance_section = """
4. A brief note on performance differences (1-2 sentences)
"""

        return f"""You are an NLP trainer helping users compare different libraries. Convert the following {source_lib} code to equivalent {target_lib} code:

Original code ({source_lib}):
```python
{code}
```

Please provide a concise educational response with:
1. The equivalent code in {target_lib} (with comments explaining key differences)
2. A brief side-by-side comparison table of the approaches (max 3 points)
3. Key advantage of each library for this specific task (just 1 per library){performance_section}

Format your response with markdown for better readability. If the code is not valid {source_lib} code or not NLP-related, explain this politely.
"""

    else:
        return "No valid prompt type specified."


def ask_gemini(question):
    """
    Send a general NLP question to Gemini and get a response.
    
    Args:
        question (str): The user's NLP-related question
        
    Returns:
        str: Response from Gemini
    """
    try:
        if not gemini_available:
            return "Sorry, Gemini API is not available. Please check your API key."

        prompt = create_gemini_prompt("general", question=question)
        model = genai.GenerativeModel(Config.GEMINI_MODEL)
        response = model.generate_content(prompt)

        return response.text
    except Exception as e:
        logger.error(
            f"Error asking Gemini: {str(e)}\n{traceback.format_exc()}")
        return f"Sorry, I couldn't generate a response due to an error: {str(e)}"


def explain_code_with_gemini(code):
    """
    Send code to Gemini for explanation.
    
    Args:
        code (str): The code to explain
        
    Returns:
        str: Explanation from Gemini
    """
    try:
        if not gemini_available:
            return "Sorry, Gemini API is not available. Please check your API key."

        prompt = create_gemini_prompt("code_explanation", code=code)
        model = genai.GenerativeModel(Config.GEMINI_MODEL)
        response = model.generate_content(prompt)

        return response.text
    except Exception as e:
        logger.error(
            f"Error explaining code with Gemini: {str(e)}\n{traceback.format_exc()}"
        )
        return f"Sorry, I couldn't explain the code due to an error: {str(e)}"


def compare_libraries_with_gemini(code,
                                  source_library,
                                  target_library,
                                  include_performance=True):
    """
    Send code to Gemini for library comparison.
    
    Args:
        code (str): The code to transform
        source_library (str): The source library (e.g., 'nltk')
        target_library (str): The target library (e.g., 'spacy')
        include_performance (bool): Whether to include performance comparison
        
    Returns:
        str: Comparison from Gemini
    """
    try:
        if not gemini_available:
            return "Sorry, Gemini API is not available. Please check your API key."

        prompt = create_gemini_prompt("library_comparison",
                                      code=code,
                                      source_library=source_library,
                                      target_library=target_library,
                                      include_performance=include_performance)

        model = genai.GenerativeModel(Config.GEMINI_MODEL)
        response = model.generate_content(prompt)

        return response.text
    except Exception as e:
        logger.error(
            f"Error comparing libraries with Gemini: {str(e)}\n{traceback.format_exc()}"
        )
        return f"Sorry, I couldn't compare the libraries due to an error: {str(e)}"
