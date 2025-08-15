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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {books.map((book) => (
        <div
          key={book._id}
          className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
        >
          <h2 className="font-bold text-2xl text-blue-700 mb-1">{book.title}</h2>
          <p className="italic text-gray-600 mb-2">by {book.author}</p>

          {book.genre && (
            <p className="text-sm text-gray-700 mb-1">
              <strong>Genre:</strong> {book.genre}
            </p>
          )}
          {book.publishedDate && (
            <p className="text-sm text-gray-500 mb-2">
              <strong>Published:</strong>{" "}
              {new Date(book.publishedDate).toLocaleDateString()}
            </p>
          )}

          <p className="mb-2">
            <strong>Availability:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                book.availability ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {book.availability ? "Available" : "Not Available"}
            </span>
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setEditingBook(book)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(book._id)}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
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
