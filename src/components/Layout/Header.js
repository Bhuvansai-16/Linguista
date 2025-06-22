import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();

  const getHeaderActions = () => {
    switch (location.pathname) {
      case '/':
        return (
          <Link to="/chat" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-chat-square-text me-1"></i> NLP Expert Chat
          </Link>
        );
      case '/chat':
        return (
          <Link to="/" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-tools me-1"></i> NLP Tools
          </Link>
        );
      case '/nlp-basics':
        return (
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-tools me-1"></i> NLP Tools
            </Link>
            <Link to="/chat" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-chat-square-text me-1"></i> AI Assistant
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="app-header">
      <div className="mobile-header d-flex d-lg-none">
        <button 
          className="sidebar-open" 
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="mobile-logo">Linguista</div>
      </div>
      
      <div className="header-actions">
        {getHeaderActions()}
      </div>
    </header>
  );
};

export default Header;