import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Smooth scroll behavior
if ('scrollBehavior' in document.documentElement.style) {
  document.documentElement.style.scrollBehavior = 'smooth';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

