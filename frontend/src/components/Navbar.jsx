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
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 shadow-md">
      <div className="flex flex-wrap justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-extrabold tracking-wide hover:text-yellow-300 transition-colors duration-200">
            BookSwap
          </Link>
          <Link to="/" className="hover:text-yellow-300 transition-colors duration-200">
            Home
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          {user ? (
            <>
              <Link to="/books" className="hover:text-yellow-300 transition-colors duration-200">
                My Books
              </Link>
              <Link to="/swap-requests" className="hover:text-yellow-300 transition-colors duration-200">
                Swap Requests
              </Link>
              <Link to="/profile" className="hover:text-yellow-300 transition-colors duration-200">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-300 transition-colors duration-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
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
