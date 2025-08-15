import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const SwapForm = ({ books, userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedBook, setSelectedBook] = useState(null);
  const [requestedBook, setRequestedBook] = useState(null);
  const [message] = useState("");

  const requestedBookId = location.state?.requestedBookId;

  useEffect(() => {
    if (books.length > 0 && requestedBookId) {
      const match = books.find(
        (book) => String(book._id?.$oid || book._id) === String(requestedBookId)
      );
      setRequestedBook(match || null);
    }
  }, [books, requestedBookId]);

  const filteredBooks = books.filter((book) => {
    const bookOwnerId =
      book.userId && typeof book.userId === "object"
        ? book.userId._id
        : book.userId;

    return (
      String(bookOwnerId) === String(userId) &&
      book.availability === true
    );
  });

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const book = filteredBooks.find((b) => b._id === selectedId) || null;
    setSelectedBook(book);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestedBook || !selectedBook) {
      alert("Please select a book to swap.");
      return;
    }

    try {
      await axiosInstance.post(
        "/api/swaps",
        {
          requestedBookId: requestedBook._id,
          offeredBookId: selectedBook._id,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      navigate("/swap-requests");
    } catch (error) {
      console.error("Swap request failed:", error);
      alert("Failed to submit swap request.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        Book Swap Request
      </h2>

      {requestedBook ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-lg font-medium text-blue-800">
            <strong>Requested Book:</strong> {requestedBook.title} by {requestedBook.author}
          </p>
        </div>
      ) : (
        <p className="text-red-500 mb-6 text-center">Requested book not found.</p>
      )}

      <label className="block font-semibold mb-2">Select Your Book to Offer</label>
      {filteredBooks.length === 0 ? (
        <p className="text-center text-gray-500 mb-4">No available books found.</p>
      ) : (
        <select
          value={selectedBook?._id || ""}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a book --</option>
          {filteredBooks.map((book) => (
            <option key={book._id} value={book._id}>
              {book.title} by {book.author}
            </option>
          ))}
        </select>
      )}

      {selectedBook && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-lg font-medium text-green-800">
            <strong>Selected Book:</strong> {selectedBook.title} by {selectedBook.author}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
      >
        Submit Swap Request
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default SwapForm;
