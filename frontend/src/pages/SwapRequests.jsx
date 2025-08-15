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

      if (action === 'accepted') {
        await Promise.all([
          axiosInstance.put(`/api/books/${requestedBook._id}`, {
            ...requestedBook,
            availability: false,
          }, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axiosInstance.put(`/api/books/${offeredBook._id}`, {
            ...offeredBook,
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

  const statusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-sm font-semibold";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "accepted":
        return `${base} bg-green-100 text-green-700`;
      case "rejected":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Swap Requests</h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Sent Requests */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Sent Requests</h2>
        {sent.length === 0 ? (
          <p className="text-gray-500">You haven't sent any swap requests.</p>
        ) : (
          <ul className="space-y-4">
            {sent.map((swap) => (
              <li key={swap._id} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                <p><strong>You offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For:</strong> {swap.requestedBook.title}</p>
                <p><strong>Status:</strong> <span className={statusBadge(swap.status)}>{swap.status}</span></p>
                <button
                  onClick={() => handleCancelSwap(swap._id, swap.status)}
                  disabled={loadingCancel || swap.status !== 'pending'}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-transform hover:scale-105"
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Received Requests</h2>
        {received.length === 0 ? (
          <p className="text-gray-500">No one has requested your books yet.</p>
        ) : (
          <ul className="space-y-4">
            {received.map((swap) => (
              <li key={swap._id} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                <p><strong>{swap.requestedBy.name} offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For your book:</strong> {swap.requestedBook.title}</p>
                <p><strong>Status:</strong> <span className={statusBadge(swap.status)}>{swap.status}</span></p>

                {swap.status === 'pending' && (
                  <div className="mt-4 flex gap-3">
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
                      className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-transform hover:scale-105"
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
                      className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 disabled:opacity-50 transition-transform hover:scale-105"
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
