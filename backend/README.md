# Linguista Backend API

Flask backend API for the Linguista NLP application.

## Features

- **NLP Processing**: Support for 10+ NLP tasks using NLTK and spaCy
- **AI Integration**: Gemini AI for chat assistance and code explanations
- **RESTful API**: Clean API endpoints for frontend integration
- **CORS Support**: Configured for React frontend communication
- **Error Handling**: Comprehensive error handling and logging

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download spaCy model:
```bash
python -m spacy download en_core_web_sm
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. Run the application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### NLP Processing
- `POST /api/process` - Process NLP tasks
- `GET /api/sample-text` - Get sample text for tasks
- `GET /api/explanation/<task>` - Get task explanations
- `GET /api/code-sample` - Get code samples

### AI Chat
- `POST /api/chat` - Chat with AI assistant
- `POST /api/generate-learning-content` - Generate learning content

### Health Check
- `GET /` - API health check

## Environment Variables

- `FLASK_DEBUG`: Enable debug mode (default: 1)
- `SESSION_SECRET`: Flask session secret key
- `GEMINI_API_KEY`: Google Gemini API key
- `GEMINI_MODEL`: Gemini model to use (default: gemini-1.5-flash)
- `PORT`: Server port (default: 5000)

## Supported NLP Tasks

1. **Tokenization** - Split text into words and sentences
2. **Stopword Removal** - Remove common words
3. **Lemmatization** - Reduce words to base forms
4. **POS Tagging** - Tag parts of speech
5. **Named Entity Recognition** - Identify entities
6. **Sentiment Analysis** - Analyze sentiment
7. **Text Summarization** - Generate summaries
8. **Keyword Extraction** - Extract keywords
9. **Text Similarity** - Compare text similarity
10. **Language Detection** - Detect text language

## Development

### Running Tests
```bash
python -m pytest tests/
```

### Code Style
```bash
flake8 .
black .
```

## Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```bash
docker build -t linguista-backend .
docker run -p 5000:5000 linguista-backend
```

## License

MIT License