import './App.css';
import HomeLandingPage from './components/Home';
import ChatbotPage from './components/ChatbotPage'; 
import Journal from './components/Journal';
import AuthPage from './components/Login';
import ExercisesResourcesPage from './components/Exercises';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero';

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/exercises" element={<ExercisesResourcesPage />} />
      </Routes>
    </Router>
  );
}

export default App;