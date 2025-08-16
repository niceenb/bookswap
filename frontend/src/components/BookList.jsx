import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import '../App.css';

const BookList = ({ books, setBooks, setEditingBook }) => {
  const { user } = useAuth();

  const handleDelete = async (bookId) => {
    try {
      await axiosInstance.delete(`/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBooks(books.filter((book) => book._id !== bookId));
    } catch (error) {
      alert('Failed to delete book.');
    }
  };

  return (
    <div className="booklist-grid">
      {books.map((book) => (
        <div key={book._id} className="book-card">
          <h2 className="book-title">{book.title}</h2>
          <p className="book-author">by {book.author}</p>

          {book.genre && (
            <p className="book-detail">
              <strong>Genre:</strong> {book.genre}
            </p>
          )}
          {book.publishedDate && (
            <p className="book-detail">
              <strong>Published:</strong> {new Date(book.publishedDate).toLocaleDateString()}
            </p>
          )}

          <p className="book-detail">
            <strong>Availability:</strong>{" "}
            <span className={`availability-tag ${book.availability ? "available" : "unavailable"}`}>
              {book.availability ? "Available" : "Not Available"}
            </span>
          </p>

          <div className="book-actions">
            <button onClick={() => setEditingBook(book)} className="edit-button">
              Edit
            </button>
            <button onClick={() => handleDelete(book._id)} className="delete-button">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
