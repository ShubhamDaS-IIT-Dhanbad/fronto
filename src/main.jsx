// src/main.jsx or index.jsx (depending on your setup)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import WebRTCProvider from './webRTCprovider.jsx'; // Adjust the import path as needed
import SocketProvider from './socketProvider.jsx'; // Import the SocketProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider> 
      
          <App />
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
