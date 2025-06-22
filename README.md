# Linguista React - Your Ultimate NLP Bot

A modern React.js application for Natural Language Processing tools and AI-powered assistance, converted from the original Flask application.

## Features

- **NLP Tools**: Interactive tools for tokenization, sentiment analysis, NER, and more
- **AI Assistant**: Chat with Gemini AI for NLP questions and code explanations
- **Learning Resources**: AI-generated content and curated learning materials
- **Code Examples**: Generate and compare NLP code across different libraries
- **Visualizations**: Interactive charts and performance comparisons
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18, React Router, Bootstrap 5
- **Charts**: Chart.js with React Chart.js 2
- **API**: Axios for HTTP requests
- **Styling**: Custom CSS with CSS variables for theming
- **Icons**: Bootstrap Icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API server running (Flask application)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd linguista-react
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create .env file in root directory
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

### Building for Production

1. Build the application:
```bash
npm run build
```

2. The build files will be in the `build/` directory, ready for deployment.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Layout/         # Layout components (Sidebar, Header, Footer)
│   ├── NLP/           # NLP-specific components
│   └── Chat/          # Chat interface components
├── contexts/          # React contexts (Theme)
├── pages/            # Page components
├── services/         # API services
├── index.css         # Global styles
├── App.js           # Main App component
└── index.js         # Entry point
```

## Key Components

### Layout Components
- **Sidebar**: Navigation with theme toggle
- **Header**: Page-specific action buttons
- **Footer**: Application footer

### NLP Components
- **TaskSelector**: Choose NLP tasks and libraries
- **TextInput**: Input text with sample text loading
- **ResultDisplay**: Display NLP processing results
- **VisualizationDisplay**: Charts and visualizations

### Pages
- **Home**: Main NLP tools interface
- **Chat**: AI assistant chat interface
- **NLPBasics**: Learning resources and AI-generated content
- **CodeExamples**: Code generation and library comparison
- **Visualizations**: Performance and feature comparisons

## API Integration

The application communicates with a Flask backend API. Key endpoints:

- `POST /api/process` - Process NLP tasks
- `GET /api/sample-text` - Get sample text for tasks
- `GET /api/explanation/{task}` - Get task explanations
- `POST /api/chat` - Chat with AI assistant
- `POST /api/generate-learning-content` - Generate learning content

## Theming

The application supports dark and light themes using CSS variables and React context:

- Theme state is managed in `ThemeContext`
- CSS variables in `:root` and `[data-theme="light"]`
- Persistent theme preference in localStorage

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Build the application:
```bash
npm run build
```

2. Deploy the `build/` directory to your hosting provider.

3. Configure environment variables on your hosting platform:
   - `REACT_APP_API_URL`: Your backend API URL

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t linguista-react .
docker run -p 3000:80 linguista-react
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API base URL (default: http://localhost:5000)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and modern web technologies
- Powered by Gemini AI for intelligent assistance
- Uses NLTK and spaCy for NLP processing
- Bootstrap for responsive design
- Chart.js for data visualizations