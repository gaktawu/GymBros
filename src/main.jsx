import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import axios from 'axios';

axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('http://localhost:5000')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    config.url = config.url.replace('http://localhost:5000', apiUrl);
  }
  return config;
  
});

const originalFetch = window.fetch;
window.fetch = async function (url, options) {
  if (typeof url === 'string' && url.includes('http://localhost:5000')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    url = url.replace('http://localhost:5000', apiUrl);
  }
  return originalFetch(url, options);
};
