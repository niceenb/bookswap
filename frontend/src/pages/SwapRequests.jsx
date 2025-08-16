import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const SwapRequests = () => {
  const { user } = useAuth();
  const currentUserId = String(user?.id);
  const [swaps, setSwaps] = useState([]);
  const [error, setError] = useState("");
  const [loadingCancelId, setLoadingCancelId] = useState(null);
  const [loadingActionId, setLoadingActionId] = useState(null);

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

  const handleCancelSwap = async (swapId) => {
    setLoadingCancelId(swapId);
    try {
      await axiosInstance.delete(`/api/swaps/${swapId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSwaps(prev => prev.filter(swap => swap._id !== swapId));
    } catch (err) {
      setError("Failed to cancel swap request.");
    } finally {
      setLoadingCancelId(null);
    }
  };

  const handleSwapAction = async (swapId, action, requestedBook, offeredBook) => {
    setLoadingActionId(swapId);
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
      setLoadingActionId(null);
    }
  };

  const sent = swaps.filter(
    swap => swap.requestedBy && String(swap.requestedBy._id) === currentUserId
  );

  const received = swaps.filter(
    swap => swap.requestedBook?.userId && String(swap.requestedBook.userId._id) === currentUserId
  );

  return (
    <div className="swap-requests-container">
      <h1 className="swap-title">Swap Requests</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Sent Requests */}
      <div className="swap-section">
        <h2 className="section-title">Sent Requests</h2>
        {sent.length === 0 ? (
          <p className="empty-message">You haven't sent any swap requests.</p>
        ) : (
          <ul className="swap-list">
            {sent.map((swap) => (
              <li key={swap._id} className="swap-card">
                <p><strong>You offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For:</strong> {swap.requestedBook.title}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${swap.status}`}>{swap.status}</span>
                </p>
                <button
                  onClick={() => {
                    if (swap.status === 'pending') {
                      handleCancelSwap(swap._id);
                    }
                  }}
                  disabled={swap.status !== 'pending' || loadingCancelId === swap._id}
                  className={`cancel-button ${swap.status !== 'pending' ? 'disabled' : ''}`}
                >
                  {loadingCancelId === swap._id ? "Cancelling..." : "Cancel Request"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Received Requests */}
      <div className="swap-section">
        <h2 className="section-title">Received Requests</h2>
        {received.length === 0 ? (
          <p className="empty-message">No one has requested your books yet.</p>
        ) : (
          <ul className="swap-list">
            {received.map((swap) => (
              <li key={swap._id} className="swap-card">
                <p><strong>{swap.requestedBy.name} offered:</strong> {swap.offeredBook.title}</p>
                <p><strong>For your book:</strong> {swap.requestedBook.title}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${swap.status}`}>{swap.status}</span>
                </p>

                {swap.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        handleSwapAction(
                          swap._id,
                          'accepted',
                          swap.requestedBook,
                          swap.offeredBook
                        )
                      }
                      disabled={loadingActionId === swap._id}
                      className="accept-button"
                    >
                      {loadingActionId === swap._id ? "Accepting..." : "Accept"}
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
                      disabled={loadingActionId === swap._id}
                      className="reject-button"
                    >
                      {loadingActionId === swap._id ? "Rejecting..." : "Reject"}
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
