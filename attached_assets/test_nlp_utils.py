import unittest
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
)

class TestNLPUtils(unittest.TestCase):
    def setUp(self):
        # Sample texts for testing
        self.general_text = "Natural language processing (NLP) is a field of artificial intelligence."
        self.ner_text = "Apple Inc. announced its new iPhone model during a press conference in California."
        self.sentiment_text = "I love this product! It's amazing and works perfectly."
        self.lang_detection_text_en = "This is an English sentence."
        self.lang_detection_text_es = "Esta es una frase en español."
        self.similarity_text1 = "The quick brown fox jumps over the lazy dog."
        self.similarity_text2 = "A fast brown fox leaps above a sleepy canine."
    
    def test_tokenization_nltk(self):
        result = perform_tokenization(self.general_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('words', result)
        self.assertIn('sentences', result)
        self.assertGreater(len(result['words']), 0)
        self.assertGreater(len(result['sentences']), 0)
    
    def test_tokenization_spacy(self):
        result = perform_tokenization(self.general_text, 'spacy')
        self.assertIsNotNone(result)
        self.assertIn('words', result)
        self.assertIn('sentences', result)
        self.assertGreater(len(result['words']), 0)
        self.assertGreater(len(result['sentences']), 0)
    
    def test_stopword_removal_nltk(self):
        result = perform_stopword_removal(self.general_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('filtered_words', result)
        self.assertIn('removed_words', result)
        self.assertGreater(len(result['filtered_words']), 0)
    
    def test_stopword_removal_spacy(self):
        result = perform_stopword_removal(self.general_text, 'spacy')
        self.assertIsNotNone(result)
        self.assertIn('filtered_words', result)
        self.assertIn('removed_words', result)
        self.assertGreater(len(result['filtered_words']), 0)
    
    def test_lemmatization_nltk(self):
        text = "The cats are running in the park"
        result = perform_lemmatization(text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('lemmatized_words', result)
        self.assertIn('lemma_dict', result)
        self.assertGreater(len(result['lemmatized_words']), 0)
    
    def test_lemmatization_spacy(self):
        text = "The cats are running in the park"
        result = perform_lemmatization(text, 'spacy')
        self.assertIsNotNone(result)
        self.assertIn('lemmatized_words', result)
        self.assertIn('lemma_dict', result)
        self.assertGreater(len(result['lemmatized_words']), 0)
    
    def test_pos_tagging_nltk(self):
        result = perform_pos_tagging(self.general_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('pos_tags', result)
        self.assertIn('pos_groups', result)
        self.assertGreater(len(result['pos_tags']), 0)
    
    def test_pos_tagging_spacy(self):
        result = perform_pos_tagging(self.general_text, 'spacy')
        self.assertIsNotNone(result)
        self.assertIn('pos_tags', result)
        self.assertIn('pos_groups', result)
        self.assertGreater(len(result['pos_tags']), 0)
    
    def test_ner_nltk(self):
        result = perform_ner(self.ner_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('entities', result)
        self.assertIn('entity_groups', result)
        # Not all texts might have entities, so don't check for length
    
    def test_ner_spacy(self):
        result = perform_ner(self.ner_text, 'spacy')
        self.assertIsNotNone(result)
        self.assertIn('entities', result)
        self.assertIn('entity_groups', result)
        # spaCy should detect entities in our sample
        self.assertGreater(len(result['entities']), 0)
    
    def test_sentiment_analysis(self):
        result, visual_data = perform_sentiment_analysis(self.sentiment_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('sentiment', result)
        self.assertIn('scores', result)
        self.assertEqual(result['sentiment'], 'Positive')
        self.assertIsNotNone(visual_data)
    
    def test_text_summarization(self):
        long_text = "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals. The term artificial intelligence had previously been used to describe machines that mimic and display human cognitive skills that are associated with the human mind, such as learning and problem-solving. This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated."
        
        result = perform_text_summarization(long_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('summary', result)
        self.assertIn('summary_sentences', result)
        self.assertGreater(len(result['summary']), 0)
        self.assertLess(len(result['summary']), len(long_text))
    
    def test_keyword_extraction(self):
        result, visual_data = perform_keyword_extraction(self.general_text, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('keywords', result)
        self.assertGreater(len(result['keywords']), 0)
        self.assertIsNotNone(visual_data)
    
    def test_text_similarity(self):
        result, visual_data = perform_text_similarity(self.similarity_text1, self.similarity_text2, 'nltk')
        self.assertIsNotNone(result)
        self.assertIn('similarity_score', result)
        self.assertIn('common_terms', result)
        self.assertGreater(result['similarity_score'], 0)
        self.assertGreater(len(result['common_terms']), 0)
        self.assertIsNotNone(visual_data)
    
    def test_language_detection_en(self):
        result = perform_language_detection(self.lang_detection_text_en)
        self.assertIsNotNone(result)
        self.assertIn('language_code', result)
        self.assertIn('language_name', result)
        self.assertEqual(result['language_code'], 'en')
        self.assertEqual(result['language_name'], 'English')
    
    def test_language_detection_es(self):
        result = perform_language_detection(self.lang_detection_text_es)
        self.assertIsNotNone(result)
        self.assertIn('language_code', result)
        self.assertIn('language_name', result)
        self.assertEqual(result['language_code'], 'es')
        self.assertEqual(result['language_name'], 'Spanish')

if __name__ == '__main__':
    unittest.main()