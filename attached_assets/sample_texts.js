// Sample texts for different NLP tasks
const sampleTexts = {
    // General sample for most tasks
    general: "Natural language processing (NLP) is a field of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate goal of NLP is to enable computers to understand, interpret, and generate human language in a way that is both meaningful and useful.",
    
    // Sample with named entities for NER
    ner: "Apple Inc. announced its new iPhone model during a press conference in Cupertino, California. Tim Cook, the CEO of Apple, said the new device would be available starting September 24th. Google and Microsoft are expected to release their competing products soon after.",
    
    // Sample for sentiment analysis
    sentiment: "I absolutely love this new restaurant! The food was delicious, the service was excellent, and the atmosphere was very welcoming. However, the parking situation was a bit difficult to navigate. Despite that minor issue, I would highly recommend it to anyone looking for a great dining experience.",
    
    // Sample for summarization (longer text)
    summarization: "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.\n\nThe term \"artificial intelligence\" had previously been used to describe machines that mimic and display human cognitive skills that are associated with the human mind, such as learning and problem-solving. This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.\n\nAI applications include advanced web search engines, recommendation systems, understanding human speech, self-driving cars, automated decision-making, and competing at the highest level in strategic game systems. As machines become increasingly capable, tasks considered to require intelligence are often removed from the definition of AI, a phenomenon known as the AI effect.",
    
    // Sample for text similarity comparison
    textSimilarity1: "The quick brown fox jumps over the lazy dog.",
    textSimilarity2: "A fast brown fox leaps above a sleepy canine.",
    
    // Sample for language detection (multiple languages)
    languageDetection: {
        english: "The quick brown fox jumps over the lazy dog.",
        spanish: "El rápido zorro marrón salta sobre el perro perezoso.",
        french: "Le rapide renard brun saute par-dessus le chien paresseux.",
        german: "Der schnelle braune Fuchs springt über den faulen Hund.",
        japanese: "速い茶色のキツネは怠け者の犬を飛び越えます。",
        chinese: "快速的棕色狐狸跳过懒狗。",
        russian: "Быстрая коричневая лиса прыгает через ленивую собаку.",
        arabic: "الثعلب البني السريع يقفز فوق الكلب الكسول."
    },
    
    // Code samples for code explanation feature
    codeSamples: {
        nltk: `import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download necessary resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Sample text
text = "Natural language processing is an exciting field of artificial intelligence."

# Tokenization
tokens = word_tokenize(text)
print("Tokens:", tokens)

# Stopword removal
stop_words = set(stopwords.words('english'))
filtered_tokens = [word for word in tokens if word.lower() not in stop_words]
print("Filtered tokens:", filtered_tokens)

# Lemmatization
lemmatizer = WordNetLemmatizer()
lemmatized_tokens = [lemmatizer.lemmatize(word) for word in filtered_tokens]
print("Lemmatized tokens:", lemmatized_tokens)`,

        spacy: `import spacy

# Load spaCy model
nlp = spacy.load('en_core_web_sm')

# Sample text
text = "Natural language processing is an exciting field of artificial intelligence."

# Process the text
doc = nlp(text)

# Tokenization
tokens = [token.text for token in doc]
print("Tokens:", tokens)

# Stopword removal
filtered_tokens = [token.text for token in doc if not token.is_stop]
print("Filtered tokens:", filtered_tokens)

# Lemmatization
lemmatized_tokens = [token.lemma_ for token in doc if not token.is_stop]
print("Lemmatized tokens:", lemmatized_tokens)

# Named Entity Recognition
entities = [(ent.text, ent.label_) for ent in doc.ents]
print("Entities:", entities)

# Part-of-speech tagging
pos_tags = [(token.text, token.pos_) for token in doc]
print("POS tags:", pos_tags)`
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined') {
    module.exports = sampleTexts;
}