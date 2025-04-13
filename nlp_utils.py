import nltk
import spacy
import logging
import string
import numpy as np
from collections import Counter
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from langdetect import detect, detect_langs, DetectorFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Set up logging
logger = logging.getLogger(__name__)

# Ensure deterministic language detection
DetectorFactory.seed = 0

# Download necessary NLTK resources with better error handling
required_resources = [
    'punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger',
    'maxent_ne_chunker', 'words', 'vader_lexicon', 'omw-1.4'
]

for resource in required_resources:
    try:
        nltk.download(resource, quiet=True)
    except Exception as e:
        logger.error(f"Error downloading NLTK resource '{resource}': {str(e)}")
        logger.info(f"Attempting to download '{resource}' with verbose output...")
        try:
            nltk.download(resource, quiet=False)
        except Exception as e:
            logger.error(f"Failed to download '{resource}' after retry: {str(e)}")

# Load spaCy models
try:
    nlp_en = spacy.load('en_core_web_sm')
except OSError:
    try:
        import subprocess
        logger.info("Downloading spaCy model 'en_core_web_sm'...")
        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], 
                       check=True, capture_output=True)
        nlp_en = spacy.load('en_core_web_sm')
    except Exception as e:
        logger.error(f"Error loading spaCy model: {str(e)}")
        # Fallback to basic spaCy model
        nlp_en = spacy.blank('en')
        logger.warning("Using blank spaCy model as fallback")

# Task 1: Tokenization
def perform_tokenization(text, library='nltk'):
    """
    Split text into words and sentences.

    Args:
        text (str): The text to tokenize
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        dict: Dictionary with tokenization results
    """
    try:
        if library == 'nltk':
            words = word_tokenize(text)
            sentences = sent_tokenize(text)
            return {
                'words': words,
                'sentences': sentences,
                'word_count': len(words),
                'sentence_count': len(sentences)
            }
        elif library == 'spacy':
            doc = nlp_en(text)
            words = [token.text for token in doc]
            sentences = [sent.text for sent in doc.sents]
            return {
                'words': words,
                'sentences': sentences,
                'word_count': len(words),
                'sentence_count': len(sentences)
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in tokenization with {library}: {str(e)}")
        raise

# Task 2: Stopword Removal
def perform_stopword_removal(text, library='nltk'):
    """
    Remove common words (stopwords) from text.

    Args:
        text (str): The text to process
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        dict: Dictionary with stopword removal results
    """
    try:
        if library == 'nltk':
            stop_words = set(stopwords.words('english'))
            words = word_tokenize(text.lower())
            filtered_words = [word for word in words if word.lower() not in stop_words 
                             and word not in string.punctuation]
            removed_words = [word for word in words if word.lower() in stop_words 
                            or word in string.punctuation]
            return {
                'original_words': words,
                'filtered_words': filtered_words,
                'removed_words': removed_words,
                'original_count': len(words),
                'filtered_count': len(filtered_words)
            }
        elif library == 'spacy':
            doc = nlp_en(text)
            filtered_words = [token.text for token in doc if not token.is_stop and not token.is_punct]
            all_words = [token.text for token in doc]
            removed_words = [token.text for token in doc if token.is_stop or token.is_punct]
            return {
                'original_words': all_words,
                'filtered_words': filtered_words,
                'removed_words': removed_words,
                'original_count': len(all_words),
                'filtered_count': len(filtered_words)
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in stopword removal with {library}: {str(e)}")
        raise

# Task 3: Lemmatization
def perform_lemmatization(text, library='nltk'):
    """
    Reduce words to their base forms (lemmas).

    Args:
        text (str): The text to lemmatize
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        dict: Dictionary with lemmatization results
    """
    try:
        if library == 'nltk':
            lemmatizer = WordNetLemmatizer()
            words = word_tokenize(text)
            lemmatized_words = [lemmatizer.lemmatize(word) for word in words]

            # Create a dict showing original and lemmatized forms
            lemma_dict = {}
            for i, word in enumerate(words):
                if word != lemmatized_words[i]:
                    lemma_dict[word] = lemmatized_words[i]

            return {
                'original_words': words,
                'lemmatized_words': lemmatized_words,
                'lemma_dict': lemma_dict
            }
        elif library == 'spacy':
            doc = nlp_en(text)
            words = [token.text for token in doc]
            lemmatized_words = [token.lemma_ for token in doc]

            # Create a dict showing original and lemmatized forms
            lemma_dict = {}
            for i, token in enumerate(doc):
                if token.text != token.lemma_:
                    lemma_dict[token.text] = token.lemma_

            return {
                'original_words': words,
                'lemmatized_words': lemmatized_words,
                'lemma_dict': lemma_dict
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in lemmatization with {library}: {str(e)}")
        raise

# Task 4: Part-of-Speech (POS) Tagging
def perform_pos_tagging(text, library='nltk'):
    """
    Tag words with their part of speech (noun, verb, etc.).

    Args:
        text (str): The text to analyze
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        dict: Dictionary with POS tagging results
    """
    try:
        if library == 'nltk':
            words = word_tokenize(text)
            pos_tags = pos_tag(words)

            # Group by POS tag
            pos_groups = {}
            for word, tag in pos_tags:
                if tag not in pos_groups:
                    pos_groups[tag] = []
                pos_groups[tag].append(word)

            return {
                'pos_tags': pos_tags,
                'pos_groups': pos_groups
            }
        elif library == 'spacy':
            doc = nlp_en(text)
            pos_tags = [(token.text, token.pos_) for token in doc]

            # Group by POS tag
            pos_groups = {}
            for token in doc:
                if token.pos_ not in pos_groups:
                    pos_groups[token.pos_] = []
                pos_groups[token.pos_].append(token.text)

            return {
                'pos_tags': pos_tags,
                'pos_groups': pos_groups
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in POS tagging with {library}: {str(e)}")
        raise

# Task 5: Named Entity Recognition (NER)
def perform_ner(text, library='nltk'):
    """
    Identify and classify named entities (people, organizations, locations, etc.).

    Args:
        text (str): The text to analyze
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        dict: Dictionary with NER results
    """
    try:
        if library == 'nltk':
            words = word_tokenize(text)
            pos_tags = pos_tag(words)
            named_entities = ne_chunk(pos_tags)

            # Extract named entities in a more usable format
            entities = []

            for chunk in named_entities:
                if hasattr(chunk, 'label'):
                    entity_type = chunk.label()
                    entity_text = ' '.join([c[0] for c in chunk])
                    entities.append({
                        'text': entity_text,
                        'type': entity_type
                    })

            # Group by entity type
            entity_groups = {}
            for entity in entities:
                if entity['type'] not in entity_groups:
                    entity_groups[entity['type']] = []
                entity_groups[entity['type']].append(entity['text'])

            return {
                'entities': entities,
                'entity_groups': entity_groups
            }
        elif library == 'spacy':
            doc = nlp_en(text)
            entities = [{'text': ent.text, 'type': ent.label_} for ent in doc.ents]

            # Group by entity type
            entity_groups = {}
            for entity in entities:
                if entity['type'] not in entity_groups:
                    entity_groups[entity['type']] = []
                entity_groups[entity['type']].append(entity['text'])

            return {
                'entities': entities,
                'entity_groups': entity_groups
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in NER with {library}: {str(e)}")
        raise

# Task 6: Sentiment Analysis
def perform_sentiment_analysis(text, library='nltk'):
    """
    Analyze the sentiment of text (positive, negative, neutral).

    Args:
        text (str): The text to analyze
        library (str): The library to use ('nltk' or other)

    Returns:
        tuple: (result_dict, visualization_data)
    """
    try:
        # NLTK's VADER sentiment analyzer
        if library == 'nltk' or library == 'spacy':  # spaCy doesn't have built-in sentiment, use NLTK
            analyzer = SentimentIntensityAnalyzer()
            scores = analyzer.polarity_scores(text)

            # Determine sentiment label
            if scores['compound'] >= 0.05:
                sentiment = 'Positive'
            elif scores['compound'] <= -0.05:
                sentiment = 'Negative'
            else:
                sentiment = 'Neutral'

            # Prepare visualization data
            visual_data = [
                {'name': 'Positive', 'value': scores['pos']},
                {'name': 'Neutral', 'value': scores['neu']},
                {'name': 'Negative', 'value': scores['neg']}
            ]

            return {
                'sentiment': sentiment,
                'scores': scores,
                'text': text
            }, visual_data
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in sentiment analysis with {library}: {str(e)}")
        raise

# Task 7: Text Summarization
def perform_text_summarization(text, library='nltk'):
    """
    Generate a summary of a longer text.

    Args:
        text (str): The text to summarize
        library (str): The library to use ('nltk' or other)

    Returns:
        dict: Dictionary with summary results
    """
    try:
        # Simple extractive summarization based on sentence scoring
        if library == 'nltk' or library == 'spacy':  # Use same algorithm for both
            # Split into sentences
            sentences = sent_tokenize(text)

            if len(sentences) <= 2:
                return {
                    'summary': text,
                    'summary_sentences': sentences,
                    'original_length': len(text),
                    'summary_length': len(text),
                    'compression_ratio': 1.0
                }

            # Calculate word frequencies
            stop_words = set(stopwords.words('english'))
            word_frequencies = {}

            for sentence in sentences:
                for word in word_tokenize(sentence.lower()):
                    if word not in stop_words and word not in string.punctuation:
                        if word not in word_frequencies:
                            word_frequencies[word] = 1
                        else:
                            word_frequencies[word] += 1

            # Normalize frequencies
            max_frequency = max(word_frequencies.values()) if word_frequencies else 1
            normalized_frequencies = {word: freq/max_frequency for word, freq in word_frequencies.items()}

            # Score sentences
            sentence_scores = {}
            for i, sentence in enumerate(sentences):
                for word in word_tokenize(sentence.lower()):
                    if word in normalized_frequencies:
                        if i not in sentence_scores:
                            sentence_scores[i] = normalized_frequencies[word]
                        else:
                            sentence_scores[i] += normalized_frequencies[word]

            # Get top sentences (about 30% of original)
            summary_size = max(1, round(len(sentences) * 0.3))
            top_indices = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:summary_size]
            top_indices = sorted(top_indices)  # Sort by original order

            summary_sentences = [sentences[i] for i in top_indices]
            summary = ' '.join(summary_sentences)

            return {
                'summary': summary,
                'summary_sentences': summary_sentences,
                'original_length': len(text),
                'summary_length': len(summary),
                'compression_ratio': len(summary) / len(text) if len(text) > 0 else 1
            }
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in text summarization with {library}: {str(e)}")
        raise

# Task 8: Keyword Extraction
def perform_keyword_extraction(text, library='nltk'):
    """
    Extract the most important keywords from text.

    Args:
        text (str): The text to analyze
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        tuple: (result_dict, visualization_data)
    """
    try:
        # Use TF-IDF for keyword extraction
        if library == 'nltk' or library == 'spacy':  # Same approach for both
            # Tokenize and remove stopwords
            stop_words = set(stopwords.words('english'))
            words = word_tokenize(text.lower())
            filtered_words = [word for word in words if word not in stop_words and 
                             word not in string.punctuation and word.isalpha()]

            # Use word frequencies as a simple keyword metric
            word_freq = Counter(filtered_words)
            total_words = len(filtered_words)

            # Calculate scores (normalized frequency)
            keyword_scores = {word: count/total_words for word, count in word_freq.items()}

            # Get top 10 keywords
            top_keywords = sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True)[:10]

            # Prepare visualization data
            visual_data = [{'name': word, 'value': score} for word, score in top_keywords]

            return {
                'keywords': dict(top_keywords),
                'keyword_list': [{'word': word, 'score': score} for word, score in top_keywords]
            }, visual_data
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in keyword extraction with {library}: {str(e)}")
        raise

# Task 9: Text Similarity
def perform_text_similarity(text1, text2, library='nltk'):
    """
    Calculate similarity between two texts.

    Args:
        text1 (str): First text to compare
        text2 (str): Second text to compare
        library (str): The library to use ('nltk' or 'spacy')

    Returns:
        tuple: (result_dict, visualization_data)
    """
    try:
        if library == 'nltk' or library == 'spacy':  # Use same algorithm for both
            # Vectorize texts using TF-IDF
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text1, text2])

            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

            # Get common and unique terms
            text1_tokens = set(word_tokenize(text1.lower()))
            text2_tokens = set(word_tokenize(text2.lower()))

            common_terms = text1_tokens.intersection(text2_tokens)
            text1_unique = text1_tokens - text2_tokens
            text2_unique = text2_tokens - text1_tokens

            # Visualization data
            visual_data = {
                'similarity_score': similarity,
                'text1_unique_count': len(text1_unique),
                'text2_unique_count': len(text2_unique),
                'common_terms_count': len(common_terms)
            }

            return {
                'similarity_score': similarity,
                'common_terms': list(common_terms),
                'text1_unique': list(text1_unique),
                'text2_unique': list(text2_unique)
            }, visual_data
        else:
            raise ValueError(f"Unsupported library: {library}")
    except Exception as e:
        logger.error(f"Error in text similarity with {library}: {str(e)}")
        raise

# Task 10: Language Detection
def perform_language_detection(text, library='langdetect'):
    """
    Detect the language of a text.

    Args:
        text (str): The text to analyze
        library (str): The library to use (only 'langdetect' supported currently)

    Returns:
        dict: Dictionary with language detection results
    """
    try:
        # Language detection using langdetect
        language_code = detect(text)

        # Get probability scores for different languages
        language_probabilities = detect_langs(text)

        # Language name mapping (limited set)
        language_names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ar': 'Arabic',
            'zh-cn': 'Chinese (Simplified)',
            'zh-tw': 'Chinese (Traditional)',
            'ja': 'Japanese',
            'ko': 'Korean',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'sv': 'Swedish'
        }

        language_name = language_names.get(language_code, f'Unknown ({language_code})')

        return {
            'language_code': language_code,
            'language_name': language_name,
            'probabilities': [{'lang': prob.lang, 'prob': prob.prob} for prob in language_probabilities],
            'text': text
        }
    except Exception as e:
        logger.error(f"Error in language detection: {str(e)}")
        raise

# Task explanations
def get_task_explanation(task):
    """
    Get explanation data for the specified NLP task.

    Args:
        task (str): The NLP task to explain

    Returns:
        dict: Explanation data
    """
    explanations = {
        'tokenization': {
            'title': 'Tokenization',
            'what': 'Tokenization is the process of breaking down text into smaller pieces called tokens. These tokens can be words, characters, or subwords.',
            'why': 'Tokenization is a fundamental step in NLP because it transforms text into a format that machines can process. It helps with analyzing text structure, extracting meaning, and preparing data for downstream tasks.',
            'how': {
                'nltk': 'NLTK uses rule-based tokenizers that split text based on whitespace and punctuation. It provides specialized tokenizers like <code>word_tokenize()</code> and <code>sent_tokenize()</code> for different levels of tokenization.',
                'spacy': 'spaCy uses a more advanced tokenization algorithm that considers language-specific rules. It tokenizes text as part of its processing pipeline, applying linguistic knowledge to identify token boundaries.'
            }
        },
        'stopword_removal': {
            'title': 'Stopword Removal',
            'what': 'Stopword removal is the process of filtering out common words (like "the", "is", "at") that typically don\'t contribute significant meaning to text analysis.',
            'why': 'Removing stopwords reduces noise in text data, decreases the dimensionality of feature vectors, and helps focus analysis on the more meaningful content words. This can improve the performance of various NLP models.',
            'how': {
                'nltk': 'NLTK provides pre-defined lists of stopwords for multiple languages. You can access these with <code>nltk.corpus.stopwords.words("english")</code> and filter words from your text using Python\'s list comprehension.',
                'spacy': 'spaCy marks stopwords in its processing pipeline with the <code>is_stop</code> attribute. You can easily filter them out by checking this property for each token object.'
            }
        },
        'lemmatization': {
            'title': 'Lemmatization',
            'what': 'Lemmatization is the process of reducing words to their base or dictionary form (lemma). For example, "running", "runs", and "ran" would all be reduced to "run".',
            'why': 'Lemmatization helps standardize text by reducing different inflected forms to a common base. This reduces vocabulary size and helps algorithms treat related word forms as the same entity.',
            'how': {
                'nltk': 'NLTK uses the WordNet lemmatizer which requires part-of-speech information for optimal results. It applies linguistic rules to determine the lemma based on the word\'s morphology.',
                'spacy': 'spaCy performs lemmatization as part of its processing pipeline, using statistical models to determine the base form. Each token has a <code>lemma_</code> attribute containing the lemmatized form.'
            }
        },
        'pos_tagging': {
            'title': 'Part-of-Speech Tagging',
            'what': 'Part-of-Speech (POS) tagging is the process of labeling each word in a text with its grammatical category such as noun, verb, adjective, etc.',
            'why': 'POS tags provide valuable grammatical information that helps with text understanding, syntactic parsing, word sense disambiguation, and information extraction.',
            'how': {
                'nltk': 'NLTK uses statistical models (like the Perceptron tagger) trained on annotated corpora. The <code>pos_tag()</code> function takes tokenized text and returns word-tag pairs.',
                'spacy': 'spaCy applies more advanced neural network models for POS tagging as part of its pipeline. Each token has a <code>pos_</code> attribute containing the coarse-grained tag and a <code>tag_</code> attribute for fine-grained tags.'
            }
        },
        'ner': {
            'title': 'Named Entity Recognition',
            'what': 'Named Entity Recognition (NER) is the task of identifying and classifying named entities in text into predefined categories such as person names, organizations, locations, etc.',
            'why': 'NER helps extract structured information from unstructured text, enabling applications like information retrieval, question answering, and relationship extraction.',
            'how': {
                'nltk': 'NLTK combines POS tagging with chunking to identify named entities. It uses a rule-based system with the <code>ne_chunk()</code> function to classify entities into categories like PERSON, ORGANIZATION, etc.',
                'spacy': 'spaCy uses statistical models to identify entities, providing better accuracy than rule-based systems. It can recognize a wide range of entity types and provides entity recognition through the <code>doc.ents</code> property.'
            }
        },
        'sentiment_analysis': {
            'title': 'Sentiment Analysis',
            'what': 'Sentiment Analysis is the process of determining the emotional tone or attitude expressed in a piece of text, typically classifying it as positive, negative, or neutral.',
            'why': 'Sentiment analysis helps understand public opinion, customer feedback, social media sentiment, and other emotional reactions expressed in text.',
            'how': {
                'nltk': 'NLTK provides the VADER (Valence Aware Dictionary and sEntiment Reasoner) tool, which is a lexicon and rule-based sentiment analyzer specifically tuned for social media text.',
                'spacy': 'While spaCy doesn\'t have built-in sentiment analysis, it can be combined with other tools or custom models. It provides a good foundation by accurately parsing text structure.'
            }
        },
        'text_summarization': {
            'title': 'Text Summarization',
            'what': 'Text summarization is the process of creating a concise and coherent version of a longer document while preserving its key information and meaning.',
            'why': 'Summarization helps manage information overload, enables quick comprehension of large documents, and supports applications like news aggregation and document indexing.',
            'how': {
                'nltk': 'Using NLTK, we can implement extractive summarization by tokenizing text into sentences, calculating importance scores (using metrics like term frequency), and selecting top-scoring sentences.',
                'spacy': 'spaCy\'s efficient text processing capabilities make it suitable for extractive summarization. Its advanced tokenization and linguistic features help identify important sentences based on various features.'
            }
        },
        'keyword_extraction': {
            'title': 'Keyword Extraction',
            'what': 'Keyword extraction identifies the most important or relevant terms in a document that best represent its content.',
            'why': 'Extracted keywords help with document indexing, content categorization, SEO optimization, and generating metadata for improved search and retrieval.',
            'how': {
                'nltk': 'Using NLTK, keywords can be extracted by calculating statistical measures like TF-IDF (Term Frequency-Inverse Document Frequency) to identify terms that are important to a document but not common across all documents.',
                'spacy': 'spaCy\'s linguistic annotations make it effective for keyword extraction by identifying noun phrases and using statistical measures to rank terms. Its part-of-speech tagging helps focus on content-bearing words.'
            }
        },
        'text_similarity': {
            'title': 'Text Similarity',
            'what': 'Text similarity is the measure of how close two pieces of text are in terms of their content, meaning, or structure.',
            'why': 'Measuring text similarity is essential for applications like plagiarism detection, recommendation systems, search engines, and document clustering.',
            'how': {
                'nltk': 'NLTK can be used to implement various similarity measures by converting text to vector representations (using techniques like bag-of-words or TF-IDF) and calculating metrics like cosine similarity.',
                'spacy': 'spaCy provides pre-trained word vectors that capture semantic meaning, allowing for more advanced similarity calculations. It has built-in methods for comparing document and span similarities.'
            }
        },
        'language_detection': {
            'title': 'Language Detection',
            'what': 'Language detection is the task of automatically identifying the natural language that a piece of text is written in.',
            'why': 'Language detection enables multilingual applications, content filtering, and proper text processing for language-specific tasks.',
            'how': {
                'nltk': 'Language detection can be implemented using statistical approaches like n-gram models that analyze character or word distributions characteristic of different languages.',
                'spacy': 'While not a primary feature, spaCy can be used with other libraries like langdetect for language identification before applying language-specific NLP models.'
            }
        }
    }

    return explanations.get(task, {
        'title': 'Unknown Task',
        'what': 'Information not available',
        'why': 'Information not available',
        'how': {
            'nltk': 'Information not available',
            'spacy': 'Information not available'
        }
    })