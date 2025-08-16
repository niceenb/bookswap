import { useNavigate } from "react-router-dom";
import "../App.css";

const AllBookList = ({ books, userId }) => {
  const navigate = useNavigate();

  const filteredBooks = !userId
    ? books
    : books.filter((book) => {
        const bookOwnerId =
          book.userId && typeof book.userId === "object" ? book.userId._id : book.userId;

        return String(bookOwnerId) !== String(userId) && book.availability === true;
      });

  const handleRequest = (bookId) => {
    navigate("/swaps", { state: { requestedBookId: bookId, requestedBy: userId } });
  };

  return (
    <div className="booklist-container">
      {filteredBooks.length === 0 ? (
        <div className="booklist-empty">No available books found. Try again later!</div>
      ) : (
        <div className="booklist-grid">
          {filteredBooks.map((book) => (
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
                  <strong>Published:</strong>{" "}
                  {new Date(book.publishedDate).toLocaleDateString()}
                </p>
              )}

              {userId && (
                <>
                  <p className={`book-availability ${book.availability ? "available" : "unavailable"}`}>
                    {book.availability ? "Available" : "Not Available"}
                  </p>

                  {book.availability && (
                    <button
                      onClick={() => handleRequest(book._id)}
                      className="request-button"
                    >
                      Request Swap
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBookList;
