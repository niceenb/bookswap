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
  const [message, setMessage] = useState("");

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

      navigate("/swap-requests"); // ✅ redirect on success
    } catch (error) {
      console.error("Swap request failed:", error);
      alert("Failed to submit swap request.");
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded shadow">
      {requestedBook ? (
        <div className="mb-4 p-4 bg-white rounded border">
          <p>
            <strong>Requested Book:</strong> {requestedBook.title} by{" "}
            {requestedBook.author}
          </p>
        </div>
      ) : (
        <p className="text-red-500 mb-4">Requested book not found.</p>
      )}

      <h2 className="font-bold text-xl mb-4">Select Your Book to Swap</h2>

      {filteredBooks.length === 0 ? (
        <p className="text-center text-gray-500">No available books found.</p>
      ) : (
        <select
          value={selectedBook?._id || ""}
          onChange={handleSelectChange}
          className="w-full border p-2 rounded"
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
        <div className="mt-4 p-4 bg-white rounded border">
          <p>
            <strong>Selected Book:</strong> {selectedBook.title} by{" "}
            {selectedBook.author}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
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
