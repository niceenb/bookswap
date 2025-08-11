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
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingBook ? 'Edit Book' : 'Add New Book'}</h1>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Author"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      {/* <input
        type="date"
        placeholder="Published Date"
        value={formData.publishedDate}
        onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      /> */}
      <input
        type="text"
        placeholder="Genre"
        value={formData.genre}
        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      
      {/* New availability checkbox */}
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={formData.availability}
          onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
          className="mr-2"
        />
        Available
      </label>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingBook ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  );
};

export default BookForm;
