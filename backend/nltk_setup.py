import nltk
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)

def initialize_nltk():
    """Initialize NLTK by downloading required resources"""
    # Create NLTK data directory
    nltk_data_dir = os.path.expanduser('~/nltk_data')
    os.makedirs(nltk_data_dir, exist_ok=True)
    
    # Add the data directory to NLTK's search path
    nltk.data.path.insert(0, nltk_data_dir)
    
    # Define resources to download
    resources = [
        'punkt',  # Important: use 'punkt' not 'punkt_tab'
        'stopwords',
        'wordnet',
        'averaged_perceptron_tagger',
        'maxent_ne_chunker',
        'words',
        'vader_lexicon',
        'omw-1.4'
    ]
    
    # Download each resource
    for resource in resources:
        try:
            logger.info(f"Downloading NLTK resource: {resource}")
            nltk.download(resource, download_dir=nltk_data_dir)
            logger.info(f"Successfully downloaded: {resource}")
        except Exception as e:
            logger.error(f"Failed to download {resource}: {str(e)}")
    
    # Log NLTK data path
    logger.info(f"NLTK data path: {nltk.data.path}")