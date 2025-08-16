import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-yellow-100 border-b border-yellow-300 text-gray-800 px-6 py-4 shadow-sm font-sans">
      <div className="flex flex-wrap justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-serif font-bold text-green-900 hover:text-green-950 transition-colors duration-200">
            BookSwap
          </Link>
          <Link to="/" className="hover:text-green-900 transition-colors duration-200">
            Home
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          {user ? (
            <>
              <Link to="/books" className="hover:text-green-900 transition-colors duration-200">
                My Books
              </Link>
              <Link to="/swap-requests" className="hover:text-green-900 transition-colors duration-200">
                Swap Requests
              </Link>
              <Link to="/profile" className="hover:text-green-900 transition-colors duration-200">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-900 transition-colors duration-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded transition duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
