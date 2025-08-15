import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BookForm = ({ books, setBooks, editingBook, setEditingBook }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publishedDate: '',
    genre: '',
    availability: true,
  });

  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title || '',
        author: editingBook.author || '',
        publishedDate: editingBook.publishedDate ? editingBook.publishedDate.split('T')[0] : '',
        genre: editingBook.genre || '',
        availability: editingBook.availability !== undefined ? editingBook.availability : true,
      });
    } else {
      setFormData({ title: '', author: '', publishedDate: '', genre: '', availability: true });
    }
  }, [editingBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        const response = await axiosInstance.put(`/api/books/${editingBook._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBooks(books.map((book) => (book._id === response.data._id ? response.data : book)));
      } else {
        const response = await axiosInstance.post('/api/books', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBooks([...books, response.data]);
      }
      setEditingBook(null);
      setFormData({ title: '', author: '', publishedDate: '', genre: '', availability: true });
    } catch (error) {
      alert('Failed to save book.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 shadow-lg rounded-xl max-w-xl mx-auto mt-6"
    >
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        {editingBook ? 'Edit Book' : 'Add New Book'}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* <div>
          <label className="block font-semibold mb-1">Published Date</label>
          <input
            type="date"
            value={formData.publishedDate}
            onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        <div>
          <label className="block font-semibold mb-1">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="font-medium">Available</label>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
        >
          {editingBook ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;
