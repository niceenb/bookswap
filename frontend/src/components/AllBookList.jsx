import { useNavigate } from "react-router-dom";

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
    <div className="px-4 py-6">
      {filteredBooks.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          No available books found. Try again later!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
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

              {userId && (
                <>
                  <p
                    className={`font-semibold mt-2 ${
                      book.availability ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {book.availability ? "Available" : "Not Available"}
                  </p>

                  {book.availability && (
                    <button
                      onClick={() => handleRequest(book._id)}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full hover:scale-105 transition-transform duration-200"
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
