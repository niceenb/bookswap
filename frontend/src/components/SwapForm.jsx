import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";
import "../App.css";

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
    <div className="swap-form">
      <h2 className="form-title">Book Swap Request</h2>

      {requestedBook ? (
        <div className="requested-book">
          <p>
            <strong>Requested Book:</strong> {requestedBook.title} by {requestedBook.author}
          </p>
        </div>
      ) : (
        <p className="error-message">Requested book not found.</p>
      )}

      <label className="form-label">Select Your Book to Offer</label>
      {filteredBooks.length === 0 ? (
        <p className="empty-message">No available books found.</p>
      ) : (
        <select
          value={selectedBook?._id || ""}
          onChange={handleSelectChange}
          className="form-select"
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
        <div className="selected-book">
          <p>
            <strong>Selected Book:</strong> {selectedBook.title} by {selectedBook.author}
          </p>
        </div>
      )}

      <button onClick={handleSubmit} className="form-button">
        Submit Swap Request
      </button>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default SwapForm;
