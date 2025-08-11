import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

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
    <div>
      {books.map((book) => (
        <div key={book._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold text-xl">{book.title}</h2>
          <p className="italic mb-1">by {book.author}</p>
          {book.genre && (
            <p className="mb-1 text-gray-700"><strong>Genre:</strong> {book.genre}</p>
          )}
          {book.publishedDate && (
            <p className="text-sm text-gray-500">
              Published: {new Date(book.publishedDate).toLocaleDateString()}
            </p>
          )}
          <p className="mb-1 text-gray-700">
            <strong>Availability:</strong> {book.availability ? 'Available' : 'Not Available'}
          </p>
          <div className="mt-2">
            <button
              onClick={() => setEditingBook(book)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(book._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
