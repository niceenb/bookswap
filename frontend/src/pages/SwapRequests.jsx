import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const SwapRequests = () => {
  const { user } = useAuth();
  const currentUserId = String(user?.id);
  const [swaps, setSwaps] = useState([]);
  const [error, setError] = useState("");
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const response = await axiosInstance.get('/api/swaps', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // ✅ Sort by newest first
        const sortedSwaps = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setSwaps(sortedSwaps);
      } catch (err) {
        setError("Failed to load swap requests.");
      }
    };

    if (user?.token) {
      fetchSwaps();
    }
  }, [user]);

  const handleCancelSwap = async (swapId, status) => {
    if (status !== 'pending') return;
    setLoadingCancel(true);
    try {
      await axiosInstance.delete(`/api/swaps/${swapId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSwaps(prev => prev.filter(swap => swap._id !== swapId));
    } catch (err) {
      setError("Failed to cancel swap request.");
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleSwapAction = async (swapId, action, requestedBook, offeredBook) => {
    setLoadingAction(true);
    try {
      await axiosInstance.patch(`/api/swaps/${swapId}`, { status: action }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // ✅ Only update availability if accepted
      if (action === 'accepted') {
        await Promise.all([
          axiosInstance.put(`/api/books/${requestedBook._id}`, {
            title: requestedBook.title,
            author: requestedBook.author,
            publishedDate: requestedBook.publishedDate,
            genre: requestedBook.genre,
            availability: false,
          }, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axiosInstance.put(`/api/books/${offeredBook._id}`, {
            title: offeredBook.title,
            author: offeredBook.author,
            publishedDate: offeredBook.publishedDate,
            genre: offeredBook.genre,
            availability: false,
          }, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
      }

      setSwaps(prev =>
        prev.map(swap =>
          swap._id === swapId ? { ...swap, status: action } : swap
        )
      );
    } catch (err) {
      setError(`Failed to ${action} swap request.`);
    } finally {
      setLoadingAction(false);
    }
  };

  const sent = swaps.filter(
    swap => swap.requestedBy && String(swap.requestedBy._id) === currentUserId
  );

  const received = swaps.filter(
    swap => swap.requestedBook?.userId && String(swap.requestedBook.userId._id) === currentUserId
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Swap Requests</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Sent Requests */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Sent Requests</h2>
        {sent.length === 0 ? (
          <p className="text-gray-500">You haven't sent any swap requests.</p>
        ) : (
          <ul className="space-y-2">
            {sent.map((swap) => (
              <li key={swap._id} className="p-4 bg-white rounded shadow">
                <p><strong>You offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For:</strong> {swap.requestedBook.title}</p>
                <p><strong>Status:</strong> {swap.status}</p>
                <button
                  onClick={() => handleCancelSwap(swap._id, swap.status)}
                  disabled={loadingCancel || swap.status !== 'pending'}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {loadingCancel ? "Cancelling..." : "Cancel Request"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Received Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Received Requests</h2>
        {received.length === 0 ? (
          <p className="text-gray-500">No one has requested your books yet.</p>
        ) : (
          <ul className="space-y-2">
            {received.map((swap) => (
              <li key={swap._id} className="p-4 bg-white rounded shadow">
                <p><strong>{swap.requestedBy.name} offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For your book:</strong> {swap.requestedBook.title}</p>
                <p><strong>Status:</strong> {swap.status}</p>

                {swap.status === 'pending' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        handleSwapAction(
                          swap._id,
                          'accepted',
                          swap.requestedBook,
                          swap.offeredBook
                        )
                      }
                      disabled={loadingAction}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleSwapAction(
                          swap._id,
                          'rejected',
                          swap.requestedBook,
                          swap.offeredBook
                        )
                      }
                      disabled={loadingAction}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SwapRequests;
