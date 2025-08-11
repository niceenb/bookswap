import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import AllBookList from '../components/AllBookList';

const Home = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/books/all');
        setBooks(response.data);
      } catch (error) {
        alert('Could not load books.');
      }
    };

    fetchAllBooks();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Books</h1>
      <AllBookList books={books} userId={user?.id} />
    </div>
  );
};

export default Home;
