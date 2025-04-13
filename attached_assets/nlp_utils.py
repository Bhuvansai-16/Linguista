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
# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('vader_lexicon')
nltk.download('omw-1.4')

# Load spaCy models
try:
    nlp_en = spacy.load('en_core_web_sm')
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp_en = spacy.load('en_core_web_sm')


# Task 1: Tokenization
def perform_tokenization(text, library='nltk'):
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

# Task 2: Stopword Removal
def perform_stopword_removal(text, library='nltk'):
    if library == 'nltk':
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(text.lower())
        filtered_words = [word for word in words if word.lower() not in stop_words and word not in string.punctuation]
        return {
            'original_words': words,
            'filtered_words': filtered_words,
            'removed_words': [word for word in words if word.lower() in stop_words or word in string.punctuation],
            'original_count': len(words),
            'filtered_count': len(filtered_words)
        }
    elif library == 'spacy':
        doc = nlp_en(text)
        filtered_words = [token.text for token in doc if not token.is_stop and not token.is_punct]
        all_words = [token.text for token in doc]
        return {
            'original_words': all_words,
            'filtered_words': filtered_words,
            'removed_words': [token.text for token in doc if token.is_stop or token.is_punct],
            'original_count': len(all_words),
            'filtered_count': len(filtered_words)
        }
    else:
        raise ValueError(f"Unsupported library: {library}")

# Task 3: Lemmatization
def perform_lemmatization(text, library='nltk'):
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

# Task 4: Part-of-Speech (POS) Tagging
def perform_pos_tagging(text, library='nltk'):
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

# Task 5: Named Entity Recognition (NER)
def perform_ner(text, library='nltk'):
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

# Task 6: Sentiment Analysis
def perform_sentiment_analysis(text, library='nltk'):
    if library == 'nltk':
        sid = SentimentIntensityAnalyzer()
        sentiment_scores = sid.polarity_scores(text)

        # Determine sentiment label
        compound = sentiment_scores['compound']
        if compound >= 0.05:
            sentiment = 'Positive'
        elif compound <= -0.05:
            sentiment = 'Negative'
        else:
            sentiment = 'Neutral'

        # Prepare visual data
        visual_data = [
            {'name': 'Positive', 'value': sentiment_scores['pos']},
            {'name': 'Neutral', 'value': sentiment_scores['neu']},
            {'name': 'Negative', 'value': sentiment_scores['neg']}
        ]

        return {
            'scores': sentiment_scores,
            'sentiment': sentiment
        }, visual_data
    elif library == 'spacy':
        # spaCy doesn't have built-in sentiment analysis, so use NLTK
        return perform_sentiment_analysis(text, 'nltk')
    else:
        raise ValueError(f"Unsupported library: {library}")

# Task 7: Text Summarization
def perform_text_summarization(text, library='nltk'):
    # For both libraries, implement a simple frequency-based extractive summarization
    if library in ['nltk', 'spacy']:
        # Tokenize sentences
        sentences = sent_tokenize(text)

        # Skip if text is too short
        if len(sentences) <= 3:
            return {
                'original_text': text,
                'summary': text,
                'summary_sentences': sentences,
                'summary_ratio': 1.0
            }

        # Preprocess text
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
        max_frequency = max(word_frequencies.values())
        for word in word_frequencies:
            word_frequencies[word] = word_frequencies[word] / max_frequency

        # Score sentences
        sentence_scores = {}
        for i, sentence in enumerate(sentences):
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    if i not in sentence_scores:
                        sentence_scores[i] = word_frequencies[word]
                    else:
                        sentence_scores[i] += word_frequencies[word]

        # Get top 30% of sentences or at least 1
        summary_length = max(1, int(len(sentences) * 0.3))
        # Get indexes of sentences with highest scores
        sorted_indexes = sorted(sentence_scores.keys(), 
                           key=lambda i: sentence_scores[i], 
                           reverse=True)[:summary_length]
        # Sort indexes to maintain original order
        summary_indexes = sorted(sorted_indexes)

        summary_sentences = [sentences[i] for i in summary_indexes]
        summary = ' '.join(summary_sentences)

        return {
            'original_text': text,
            'summary': summary,
            'summary_sentences': summary_sentences,
            'summary_ratio': len(summary_sentences) / len(sentences)
        }
    else:
        raise ValueError(f"Unsupported library: {library}")

# Task 8: Keyword Extraction
def perform_keyword_extraction(text, library='nltk'):
    if library == 'nltk':
        # Using simple TF-IDF approach with scikit-learn
        sentences = sent_tokenize(text)

        # If text is too short, return all non-stopwords as keywords
        if len(sentences) <= 1:
            stop_words = set(stopwords.words('english'))
            words = [word.lower() for word in word_tokenize(text) 
                    if word.lower() not in stop_words and word not in string.punctuation]
            word_freq = Counter(words)
            keywords = [{'word': word, 'score': freq/len(words)} for word, freq in word_freq.most_common(10)]

            # Prepare visual data
            visual_data = [{'name': kw['word'], 'value': kw['score']} for kw in keywords]

            return {
                'keywords': keywords
            }, visual_data

        # For longer texts, use TF-IDF
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(sentences)

        # Get feature names
        feature_names = vectorizer.get_feature_names_out()

        # Get TF-IDF scores
        dense = X.todense()
        denselist = dense.tolist()

        # Sum TF-IDF scores across all sentences for each word
        word_scores = {}
        for i, sentence_scores in enumerate(denselist):
            for j, score in enumerate(sentence_scores):
                word = feature_names[j]
                if word not in word_scores:
                    word_scores[word] = score
                else:
                    word_scores[word] += score

        # Sort keywords by score
        keywords = [{'word': word, 'score': score} for word, score in sorted(word_scores.items(), key=lambda x: x[1], reverse=True)[:10]]

        # Prepare visual data
        visual_data = [{'name': kw['word'], 'value': kw['score']} for kw in keywords]

        return {
            'keywords': keywords
        }, visual_data
    elif library == 'spacy':
        doc = nlp_en(text)

        # Extract noun chunks and lemmatize
        keywords = []
        seen = set()

        # Add noun chunks that aren't stopwords
        for chunk in doc.noun_chunks:
            if not chunk.root.is_stop and len(chunk.text) > 2:
                if chunk.root.lemma_ not in seen:
                    seen.add(chunk.root.lemma_)
                    keywords.append({'word': chunk.text, 'score': chunk.root.prob})

        # Add named entities
        for ent in doc.ents:
            if ent.text.lower() not in seen:
                seen.add(ent.text.lower())
                keywords.append({'word': ent.text, 'score': 0.1})  # Arbitrary score for entities

        # Add frequent nouns, verbs, and adjectives
        for token in doc:
            if (token.pos_ in ['NOUN', 'VERB', 'ADJ'] and 
                not token.is_stop and 
                token.lemma_ not in seen and
                len(token.text) > 2):
                seen.add(token.lemma_)
                keywords.append({'word': token.text, 'score': token.prob})

        # Sort by score and limit to top 10
        keywords = sorted(keywords, key=lambda x: x['score'], reverse=True)[:10]

        # Normalize scores
        if keywords:
            max_score = max(k['score'] for k in keywords)
            for k in keywords:
                k['score'] = k['score'] / max_score

        # Prepare visual data
        visual_data = [{'name': kw['word'], 'value': kw['score']} for kw in keywords]

        return {
            'keywords': keywords
        }, visual_data
    else:
        raise ValueError(f"Unsupported library: {library}")

# Task 9: Text Similarity
def perform_text_similarity(text1, text2, library='nltk'):
    if library == 'nltk':
        # Using TF-IDF and cosine similarity
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])

        # Calculate cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        # Get common and unique terms
        text1_tokens = set(word_tokenize(text1.lower()))
        text2_tokens = set(word_tokenize(text2.lower()))

        common_terms = text1_tokens.intersection(text2_tokens)
        unique_to_text1 = text1_tokens - text2_tokens
        unique_to_text2 = text2_tokens - text1_tokens

        # Prepare visual data
        visual_data = {
            'similarity_score': cosine_sim,
            'common_terms_count': len(common_terms),
            'text1_unique_count': len(unique_to_text1),
            'text2_unique_count': len(unique_to_text2)
        }

        return {
            'similarity_score': cosine_sim,
            'common_terms': list(common_terms),
            'unique_to_text1': list(unique_to_text1),
            'unique_to_text2': list(unique_to_text2)
        }, visual_data
    elif library == 'spacy':
        # Using spaCy's built-in similarity
        doc1 = nlp_en(text1)
        doc2 = nlp_en(text2)

        # Calculate similarity
        similarity_score = doc1.similarity(doc2)

        # Get common and unique terms
        text1_tokens = {token.lemma_ for token in doc1 if not token.is_stop and not token.is_punct}
        text2_tokens = {token.lemma_ for token in doc2 if not token.is_stop and not token.is_punct}

        common_terms = text1_tokens.intersection(text2_tokens)
        unique_to_text1 = text1_tokens - text2_tokens
        unique_to_text2 = text2_tokens - text1_tokens

        # Prepare visual data
        visual_data = {
            'similarity_score': float(similarity_score),  # Convert numpy float to Python float
            'common_terms_count': len(common_terms),
            'text1_unique_count': len(unique_to_text1),
            'text2_unique_count': len(unique_to_text2)
        }

        return {
            'similarity_score': float(similarity_score),  # Convert numpy float to Python float
            'common_terms': list(common_terms),
            'unique_to_text1': list(unique_to_text1),
            'unique_to_text2': list(unique_to_text2)
        }, visual_data
    else:
        raise ValueError(f"Unsupported library: {library}")

# Task 10: Language Detection
def perform_language_detection(text, library='nltk'):
    # Both NLTK and spaCy implementations use langdetect under the hood
    try:
        # Make detection deterministic
        DetectorFactory.seed = 0
        language_code = detect(text)

        # Map language codes to full names
        language_map = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'nl': 'Dutch',
            'ru': 'Russian',
            'zh-cn': 'Chinese (Simplified)',
            'zh-tw': 'Chinese (Traditional)',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'pl': 'Polish',
            'uk': 'Ukrainian',
            'cs': 'Czech',
            'sv': 'Swedish',
            'da': 'Danish',
            'fi': 'Finnish',
            'no': 'Norwegian',
            'hu': 'Hungarian',
            'el': 'Greek',
            'bg': 'Bulgarian',
            'ro': 'Romanian',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'id': 'Indonesian',
            'ms': 'Malay',
            'fa': 'Persian',
            'he': 'Hebrew',
            'ur': 'Urdu',
            'bn': 'Bengali'
        }

        language_name = language_map.get(language_code, f"Unknown ({language_code})")

        # Extract sample words (first few tokens)
        tokens = []
        if library == 'nltk':
            tokens = word_tokenize(text)[:5]  # First 5 tokens
        elif library == 'spacy':
            doc = nlp_en(text)
            tokens = [token.text for token in doc][:5]

        # Additional language features if available
        language_features = {}
        if language_code == 'en':
            language_features = {
                'script': 'Latin',
                'language_family': 'Indo-European > Germanic',
                'writing_direction': 'Left-to-right'
            }
        elif language_code in ['es', 'fr', 'it', 'pt']:
            language_features = {
                'script': 'Latin',
                'language_family': 'Indo-European > Romance',
                'writing_direction': 'Left-to-right'
            }
        elif language_code in ['ru', 'bg', 'uk']:
            language_features = {
                'script': 'Cyrillic',
                'language_family': 'Indo-European > Slavic',
                'writing_direction': 'Left-to-right'
            }
        elif language_code in ['ar', 'fa', 'ur']:
            language_features = {
                'script': 'Arabic/Persian',
                'language_family': 'Afro-Asiatic / Indo-European',
                'writing_direction': 'Right-to-left'
            }
        elif language_code in ['zh-cn', 'zh-tw', 'ja']:
            language_features = {
                'script': 'Han/Kanji',
                'language_family': 'Sino-Tibetan / Japonic',
                'writing_direction': 'Left-to-right / Top-to-bottom'
            }

        return {
            'language_code': language_code,
            'language_name': language_name,
            'confidence': 0.9,  # langdetect doesn't provide confidence, so we use a default
            'sample_tokens': tokens,
            'language_features': language_features
        }
    except Exception as e:
        return {
            'error': str(e),
            'language_code': 'unknown',
            'language_name': 'Unknown (Could not detect)',
            'confidence': 0.0,
            'sample_tokens': [],
            'language_features': {}
        }

# Task explanations
def get_task_explanation(task):
    explanations = {
        'tokenization': {
            'title': 'Tokenization',
            'what': 'Tokenization is the process of breaking text into smaller units called tokens. These tokens can be words, characters, or subwords.',
            'why': 'It\'s a fundamental step in NLP that converts raw text into a format computers can process. Tokenization enables various downstream tasks like counting word frequencies, text classification, and more.',
            'how': {
                'nltk': 'NLTK uses rule-based tokenizers. The word_tokenize() function uses the Penn Treebank tokenization algorithm, which handles punctuation and contractions.',
                'spacy': 'spaCy uses a more sophisticated tokenizer that considers linguistic rules and can be trained on different languages. It maintains token boundaries and spacing information.'
            }
        },
        'stopword_removal': {
            'title': 'Stopword Removal',
            'what': 'Stopwords are common words (like "the", "is", "and") that typically don\'t contribute much meaning to a text. Stopword removal filters these words out.',
            'why': 'Removing stopwords reduces noise in text data and helps focus on the meaningful content. It\'s useful for tasks like keyword extraction, text summarization, and document classification.',
            'how': {
                'nltk': 'NLTK provides predefined lists of stopwords for many languages. You can access them through the nltk.corpus.stopwords module.',
                'spacy': 'spaCy marks stopwords with the is_stop attribute on tokens. It integrates stopword detection into its processing pipeline.'
            }
        },
        'lemmatization': {
            'title': 'Lemmatization',
            'what': 'Lemmatization reduces words to their base or dictionary form (lemma). For example, "running" becomes "run" and "better" becomes "good".',
            'why': 'It helps standardize words to their common roots, reducing vocabulary size and improving text analysis by treating different forms of the same word as a single item.',
            'how': {
                'nltk': 'NLTK uses WordNetLemmatizer which is based on WordNet. It requires the part-of-speech of the word to provide accurate lemmatization.',
                'spacy': 'spaCy uses a statistical model for lemmatization that considers the word\'s context and part-of-speech tag to determine the correct lemma.'
            }
        },
        'pos_tagging': {
            'title': 'Part-of-Speech (POS) Tagging',
            'what': 'POS tagging is the process of marking each word in a text with its corresponding part of speech (e.g., noun, verb, adjective).',
            'why': 'It provides grammatical information about words and their relationships, which is essential for understanding sentence structure and meaning. POS tags help in many NLP tasks like parsing, information extraction, and speech recognition.',
            'how': {
                'nltk': 'NLTK uses the Perceptron tagger, which is trained on the Penn Treebank corpus. It assigns Penn Treebank tags like NN (noun), VB (verb), etc.',
                'spacy': 'spaCy uses a statistical model that considers the surrounding context to predict the most likely POS tag for each word.'
            }
        },
        'ner': {
            'title': 'Named Entity Recognition (NER)',
            'what': 'Named Entity Recognition identifies and classifies named entities in text into predefined categories like person names, organizations, locations, dates, etc.',
            'why': 'NER helps extract structured information from unstructured text. It\'s useful for information retrieval, question answering, and building knowledge bases.',
            'how': {
                'nltk': 'NLTK uses a rule-based approach combined with a maximum entropy classifier. It first performs POS tagging and then applies the ne_chunk function.',
                'spacy': 'spaCy uses a statistical model that predicts entity labels based on local context. It\'s generally more accurate and can recognize a wider range of entity types.'
            }
        },
        'sentiment_analysis': {
            'title': 'Sentiment Analysis',
            'what': 'Sentiment analysis determines the emotional tone behind a body of text. It classifies text as positive, negative, or neutral.',
            'why': 'It helps understand opinions and emotions in text data, which is valuable for social media monitoring, customer feedback analysis, and market research.',
            'how': {
                'nltk': 'NLTK uses VADER (Valence Aware Dictionary and sEntiment Reasoner), a rule-based sentiment analyzer specifically attuned to sentiments expressed in social media.',
                'spacy': 'spaCy doesn\'t have built-in sentiment analysis capabilities, so we use NLTK\'s VADER when "spacy" is selected.'
            }
        },
        'text_summarization': {
            'title': 'Text Summarization',
            'what': 'Text summarization creates a shorter version of a text while preserving its key information and meaning.',
            'why': 'It helps handle information overload by condensing large volumes of text into essential points, saving time while maintaining comprehension.',
            'how': {
                'nltk': 'We implement extractive summarization using a frequency-based approach. It identifies important sentences based on the frequency of significant words.',
                'spacy': 'The same extractive approach is used with spaCy, calculating sentence importance based on the frequency of non-stopwords.'
            }
        },
        'keyword_extraction': {
            'title': 'Keyword Extraction',
            'what': 'Keyword extraction identifies the most important words or phrases in a document that best represent its content.',
            'why': 'It helps in indexing documents, improving search relevance, content categorization, and topic modeling.',
            'how': {
                'nltk': 'We use TF-IDF (Term Frequency-Inverse Document Frequency) to identify words that are important to a document but not too common across all documents.',
                'spacy': 'With spaCy, we extract important terms based on linguistic features like noun chunks, named entities, and part-of-speech tags.'
            }
        },
        'text_similarity': {
            'title': 'Text Similarity',
            'what': 'Text similarity measures how similar two texts are to each other in terms of content, meaning, or structure.',
            'why': 'It\'s useful for duplicate detection, plagiarism checking, information retrieval, and recommendation systems.',
            'how': {
                'nltk': 'We use TF-IDF vectorization to convert texts into numerical representations and then calculate cosine similarity between the vectors.',
                'spacy': 'spaCy provides a built-in similarity method that compares document vectors based on word embeddings, capturing semantic similarity.'
            }
        },
        'language_detection': {
            'title': 'Language Detection',
            'what': 'Language detection identifies the natural language that a text is written in.',
            'why': 'It\'s essential for preprocessing multilingual data, routing text to language-specific NLP pipelines, and content filtering.',
            'how': {
                'langdetect': 'We use the langdetect library, which is a port of Google\'s language-detection library. It supports over 50 languages and uses a naive Bayesian classifier with character n-gram features.'
            }
        }
    }

    return explanations.get(task, {
        'title': 'Unknown Task',
        'what': 'No explanation available for this task.',
        'why': 'N/A',
        'how': {
            'nltk': 'N/A',
            'spacy': 'N/A'
        }
    })