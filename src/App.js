import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import NLPBasics from './pages/NLPBasics';
import CodeExamples from './pages/CodeExamples';
import Visualizations from './pages/Visualizations';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/nlp-basics" element={<NLPBasics />} />
            <Route path="/code-examples" element={<CodeExamples />} />
            <Route path="/visualizations" element={<Visualizations />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;