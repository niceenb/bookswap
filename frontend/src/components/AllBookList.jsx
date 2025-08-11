const AllBookList = ({ books, userId }) => {
  const filteredBooks = !userId
    ? books
    : books.filter((book) => {
        const bookOwnerId =
          book.userId && typeof book.userId === 'object' ? book.userId._id : book.userId;

        return String(bookOwnerId) !== String(userId) && book.availability === true;
      });

  const handleRequest = (bookId) => {
    alert(`Request sent for book ID: ${bookId}`);
  };

  return (
    <div>
      {filteredBooks.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No available books found.</p>
      )}
      {filteredBooks.map((book) => (
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
          {userId && (
            <p className={`font-semibold mt-2 ${book.availability ? 'text-green-600' : 'text-red-600'}`}>
              {book.availability ? 'Available' : 'Not Available'}
            </p>
          )}
          <div className="mt-2">
            <button
              onClick={() => handleRequest(book._id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Request
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllBookList;
