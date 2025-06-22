import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: 'bi-tools', label: 'NLP Tools' },
    { path: '/chat', icon: 'bi-chat-square-text', label: 'AI Assistant' },
  ];

  const learningItems = [
    { path: '/nlp-basics', icon: 'bi-book', label: 'NLP Basics' },
    { path: '/code-examples', icon: 'bi-code-square', label: 'Code Examples' },
    { path: '/visualizations', icon: 'bi-graph-up', label: 'Visualizations' },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="logo" onClick={onClose}>
          <i className="bi bi-chat-square-dots"></i>
          <span>Linguista</span>
        </Link>
        <button 
          className="sidebar-toggle d-lg-none" 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-list-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            
            <li className="nav-section">
              <div className="nav-section-header">
                <span>Learning Resources</span>
              </div>
            </li>
            
            {learningItems.map((item) => (
              <li key={item.path} className="nav-list-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="sidebar-footer">
        <div className="theme-switcher">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            <span className="theme-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        <div className="sidebar-info">
          <small>Powered by Gemini AI</small>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;