import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import SwapForm from '../components/SwapForm'; // ✅ fixed import
import { useAuth } from '../context/AuthContext';

const Swaps = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/books/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBooks(response.data);
      } catch (error) {
        alert('Failed to fetch books.');
      }
    };

    fetchBooks();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <SwapForm books={books} setBooks={setBooks} userId={user?.id} />
    </div>
  );
};

export default Swaps;
