# Linguista - Your Ultimate NLP Bot

## Overview

Linguista is a powerful, locally-run NLP chatbot that leverages NLTK, spaCy, and state-of-the-art transformer models to perform a suite of language tasks without relying on third-party APIs. From sentiment analysis to text summarization, Linguista delivers fast, accurate insights directly on your machine.

## Key Features

- **Sentiment Analysis** — Determine the emotional tone of any text
- **Named Entity Recognition** — Identify and classify entities like people, organizations, and locations
- **Text Summarization** — Generate concise summaries from longer documents
- **Machine Translation** — Translate text between multiple languages
- **Keyword Extraction** — Highlight the most important terms in a body of text
- **Content Generation** — Generate NLP content using the Gemini API
- **Chat Bot** — Interactive bot that can answer questions on NLP
- **Learning Resources** — Curated links to courses for learning NLP

## Technology Stack

- **NLP Libraries**: NLTK, spaCy
- **AI Integration**: Google Gemini API
- **Development**: Built using Replit

## Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/Bhuvansai-16/Linguista.git
   cd Linguista
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables
   Create a `.env` file in the project root with the following variables:
   ```
   PORT=8000
   GEMINI_API_KEY=your-api-key
   ```

4. Run the application
   ```bash
   python app.py
   ```

## Getting a Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in your `.env` file

## Project Structure

```
Linguista/
├── app.py              # Main application entry point
├── models/             # NLP model implementations
├── utils/              # Helper functions and utilities
├── static/             # Static assets (CSS, JS, images)
├── templates/          # HTML templates
├── requirements.txt    # Project dependencies
└── README.md           # Project documentation
```

## Contributing

We welcome contributions! Please follow these steps to get started:

1. Fork this repository
2. Create a new feature branch: `git checkout -b feature/YourFeatureName`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/YourFeatureName`
5. Open a Pull Request and describe your changes

Read `CONTRIBUTING.md` for more details.

## License

Distributed under the MIT License. See `LICENSE` for details.

## Contact

- **GitHub**: [Bhuvansai-16/Linguista](https://github.com/Bhuvansai-16/Linguista)
- **Email**: chbhuvansai522@gmail.com
- **Built using**: [Replit](https://replit.com/)
