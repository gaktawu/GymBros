import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiUrl = rawApiUrl.replace(/\/$/, ''); // Contoh: https://gymbros-backend.up.railway.app
const wsUrl = apiUrl.replace(/^http/, 'ws'); // Otomatis jadi: wss://gymbros-backend.up.railway.app

axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.includes('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', apiUrl);
    } else if (config.url.startsWith('/api') || config.url.startsWith('/socket.io')) {
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
    } else if (url.startsWith('/api') || url.startsWith('/socket.io')) {
      url = `${apiUrl}${url}`;
    }
  }
  return originalFetch(url, options);
};

const originalXhrOpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  if (typeof url === 'string') {
    if (url.includes('http://localhost:5000')) {
      url = url.replace('http://localhost:5000', apiUrl);
    } else if (url.startsWith('/api') || url.startsWith('/socket.io')) {
      url = `${apiUrl}${url}`;
    }
  }
  return originalXhrOpen.call(this, method, url, ...rest);
};

const OriginalWebSocket = window.WebSocket;
window.WebSocket = function (url, protocols) {
  if (typeof url === 'string') {
    if (url.includes('localhost:5000')) {
      url = url.replace(/ws:\/\/localhost:5000|http:\/\/localhost:5000|wss:\/\/localhost:5000/g, wsUrl);
    } else if (url.startsWith('/socket.io')) {
      url = `${wsUrl}${url}`;
    }
  }
  return new OriginalWebSocket(url, protocols);
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)