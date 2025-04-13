import logging
import traceback
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
    perform_language_detection
)

# Setup logger
logger = logging.getLogger(__name__)

def validate_text_input(text, task, comparison_text=None):
    """
    Validate text input for NLP tasks.
    
    Args:
        text (str): The main text to process
        task (str): The NLP task to perform
        comparison_text (str, optional): Secondary text for comparison tasks
        
    Returns:
        str: Error message if validation fails, None otherwise
    """
    if not text:
        return "Text input cannot be empty"
        
    if len(text) < 3:
        return "Text input must be at least 3 characters long"
        
    if task == 'text_summarization' and len(text) < 200:
        return "For text summarization, input must be at least 200 characters long"
        
    if task == 'text_similarity':
        if not comparison_text:
            return "Comparison text is required for text similarity analysis"
        if len(comparison_text) < 3:
            return "Comparison text must be at least 3 characters long"
            
    return None

def process_nlp_task(task, library, text, comparison_text=None):
    """
    Process the requested NLP task with error handling.
    
    Args:
        task (str): The NLP task to perform
        library (str): The library to use ('nltk' or 'spacy')
        text (str): The text to process
        comparison_text (str, optional): Secondary text for comparison tasks
        
    Returns:
        tuple: (result_dict, visualization_data)
        
    Raises:
        ValueError: If inputs are invalid
        Exception: For other processing errors
    """
    try:
        # Validate library choice
        if library not in ['nltk', 'spacy']:
            library = 'nltk'  # Default to nltk if invalid
            
        # Process based on task
        if task == 'tokenization':
            result = perform_tokenization(text, library)
            return result, None
            
        elif task == 'stopword_removal':
            result = perform_stopword_removal(text, library)
            return result, None
            
        elif task == 'lemmatization':
            result = perform_lemmatization(text, library)
            return result, None
            
        elif task == 'pos_tagging':
            result = perform_pos_tagging(text, library)
            return result, None
            
        elif task == 'ner':
            result = perform_ner(text, library)
            return result, None
            
        elif task == 'sentiment_analysis':
            return perform_sentiment_analysis(text, library)
            
        elif task == 'text_summarization':
            result = perform_text_summarization(text, library)
            return result, None
            
        elif task == 'keyword_extraction':
            return perform_keyword_extraction(text, library)
            
        elif task == 'text_similarity':
            if not comparison_text:
                raise ValueError("Comparison text is required for text similarity analysis")
            return perform_text_similarity(text, comparison_text, library)
            
        elif task == 'language_detection':
            result = perform_language_detection(text)
            return result, None
            
        else:
            raise ValueError(f"Unsupported task: {task}")
            
    except Exception as e:
        logger.error(f"Error processing {task} with {library}: {str(e)}\n{traceback.format_exc()}")
        raise

def get_code_samples():
    """
    Get code samples for the code explanation panel.
    
    Returns:
        dict: Code samples keyed by sample type
    """
    return {
        'nltk-tokenize': '''# Basic NLTK tokenization example
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize

# Download required resources
nltk.download('punkt')

# Sample text
text = "Hello world! This is an example of NLTK tokenization. It works with multiple sentences."

# Sentence tokenization
sentences = sent_tokenize(text)
print("Sentences:", sentences)

# Word tokenization
words = word_tokenize(text)
print("Words:", words)

# Count tokens
print(f"Number of sentences: {len(sentences)}")
print(f"Number of words: {len(words)}")''',

        'spacy-ner': '''# spaCy Named Entity Recognition example
import spacy

# Load English language model
nlp = spacy.load("en_core_web_sm")

# Sample text
text = "Apple Inc. was founded by Steve Jobs in California. Microsoft is headquartered in Redmond, Washington."

# Process the text
doc = nlp(text)

# Extract named entities
for ent in doc.ents:
    print(f"Entity: {ent.text}, Type: {ent.label_}, Description: {spacy.explain(ent.label_)}")

# Visualize entities (in notebook/supported environment)
# from spacy import displacy
# displacy.render(doc, style="ent")''',

        'sklearn-vectorizer': '''# Text vectorization with scikit-learn
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

# Sample documents
documents = [
    "Machine learning is a subset of artificial intelligence.",
    "Natural language processing uses machine learning techniques.",
    "TF-IDF helps determine the importance of words in documents."
]

# Create a bag-of-words vectorizer
count_vectorizer = CountVectorizer()
count_matrix = count_vectorizer.fit_transform(documents)

# Get feature names (words)
feature_names = count_vectorizer.get_feature_names_out()
print("Vocabulary:", feature_names)
print("Document vectors shape:", count_matrix.shape)

# Create a TF-IDF vectorizer
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

# Print the TF-IDF scores for the first document
first_doc_vector = tfidf_matrix[0]
for idx, score in zip(first_doc_vector.indices, first_doc_vector.data):
    print(f"Word: {tfidf_vectorizer.get_feature_names_out()[idx]}, TF-IDF: {score:.4f}")'''
    }