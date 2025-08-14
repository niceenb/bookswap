import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Books from './pages/Books';
import Home from './pages/Home';
import Swaps from './pages/Swaps';
import SwapRequests from './pages/SwapRequests';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/books" element={<Books />} />
        <Route path="/swaps" element={<Swaps />} />
        <Route path="/swap-requests" element={<SwapRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
