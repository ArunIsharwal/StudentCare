import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import FoodAnalysis from './pages/FoodAnalysis';
import WeatherAQI from './pages/WeatherAQI';
import Chatbot from './pages/Chatbot';
import StressMonitoring from './pages/StressMonitoring';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const baseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_URL ||
  import.meta.env.URL ||
  'http://localhost:8000';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="food-analysis" element={<FoodAnalysis />} />
          <Route path="weather" element={<WeatherAQI />} />
          <Route path="stress-monitoring" element={<StressMonitoring />} />
          
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="chatbot" element={<Chatbot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
