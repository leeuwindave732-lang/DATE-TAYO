import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import ResetRequestPage from './pages/ResetRequestPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Password Reset Flow */}
        <Route path="/reset-request" element={<ResetRequestPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Optional: view another user's profile */}
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
