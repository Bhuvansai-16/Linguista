import os
import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


class Config:
    """Configuration settings for the application."""

    # Flask configuration
    SECRET_KEY = os.environ.get("SESSION_SECRET", "dev-secret-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"

    # Gemini API configuration
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

    # NLP default settings
    DEFAULT_LIBRARY = "nltk"
    DEFAULT_SAMPLE_TEXT = "Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language."

    # Sample texts for different tasks
    SAMPLE_TEXTS = {
        "tokenization":
        "The quick brown fox jumps over the lazy dog. This is a sample sentence for tokenization.",
        "stopword_removal":
        "The quick brown fox jumps over the lazy dog. This is a sample sentence for stopword removal with common words like the, is, and, of.",
        "lemmatization":
        "The cats are running in the garden. They were eating the food that was prepared by their owners. I am walking to the store.",
        "pos_tagging":
        "The quick brown fox quickly jumps over the lazy dog. I love to read interesting books about artificial intelligence.",
        "ner":
        "Apple Inc. was founded by Steve Jobs in California. Microsoft is headquartered in Redmond, Washington. Elon Musk is the CEO of Tesla and SpaceX.",
        "sentiment_analysis":
        "I absolutely love this product! It's amazing and exceeded all my expectations. The quality is outstanding and the service was excellent.",
        "text_summarization":
        "Natural Language Processing (NLP) is a field of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate objective of NLP is to read, decipher, understand, and make sense of human language in a valuable way. Most NLP techniques rely on machine learning to derive meaning from human languages. NLP tasks include text classification, sentiment analysis, speech recognition, machine translation, named entity recognition, topic modeling, and question answering systems. NLP combines computational linguistics—rule-based modeling of human language—with statistical, machine learning, and deep learning models. These technologies enable computers to process human language in the form of text or voice data and to 'understand' its full meaning, complete with the speaker or writer's intent and sentiment. NLP drives computer programs that translate text from one language to another, respond to spoken commands, and summarize large volumes of text rapidly—even in real time. There's a tremendous amount of information stored in free text files, such as patients' medical records. Before deep learning-based NLP models, this information was inaccessible to computer-assisted analysis and could not be analyzed in any systematic way. The implementation of NLP systems has helped to address this problem by making it possible to analyze large amounts of text data.",
        "keyword_extraction":
        "Machine learning is the study of computer algorithms that improve automatically through experience. It is seen as a subset of artificial intelligence. Machine learning algorithms build a mathematical model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so.",
        "text_similarity":
        "Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language.",
        "language_detection":
        "Hello, this is a sample text in English to test language detection capabilities of our natural language processing system."
    }

    # Additional sample text pairs for comparison
    TEXT_PAIRS = {
        "text_similarity": {
            "text1":
            "Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language.",
            "text2":
            "NLP is a branch of AI that focuses on the interaction between computers and human languages. It involves processing and analyzing large amounts of natural language data."
        }
    }
