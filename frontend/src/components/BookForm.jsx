import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import '../App.css';

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
    <form onSubmit={handleSubmit} className="book-form">
      <h1 className="form-title">
        {editingBook ? 'Edit Book' : 'Add New Book'}
      </h1>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Author</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>

      {/* Uncomment if you want to include published date */}
      {/* <div className="form-group">
        <label>Published Date</label>
        <input
          type="date"
          value={formData.publishedDate}
          onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
        />
      </div> */}

      <div className="form-group">
        <label>Genre</label>
        <input
          type="text"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
        />
      </div>

      <div className="form-checkbox">
        <input
          type="checkbox"
          checked={formData.availability}
          onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
        />
        <label>Available</label>
      </div>

      <button type="submit" className="form-button">
        {editingBook ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  );
};

export default BookForm;
