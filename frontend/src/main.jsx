import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <Router>
        <App />
      </Router>
  </StrictMode>
);
