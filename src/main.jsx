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

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiUrl = rawApiUrl.replace(/\/$/, '');


axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.includes('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', apiUrl);
    } else if (config.url.startsWith('/api')) {
      config.url = `${apiUrl}${config.url}`;
    }
  }
  return config;
});

const originalFetch = window.fetch;
window.fetch = async function (url, options) {
  if (typeof url === 'string') {
    if (url.includes('http://localhost:5000')) {
      url = url.replace('http://localhost:5000', apiUrl);
    } else if (url.startsWith('/api')) {
      url = `${apiUrl}${url}`;
    }
  }
  return originalFetch(url, options);
};

