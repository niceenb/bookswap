const Swap = require('../models/Swap'); // You’ll need to create this model
const Book = require('../models/Book');

const createSwapRequest = async (req, res) => {
  const { requestedBookId, offeredBookId } = req.body;

  try {
    const requestedBook = await Book.findById(requestedBookId);
    const offeredBook = await Book.findById(offeredBookId);

    if (!requestedBook || !offeredBook) {
      return res.status(404).json({ message: 'One or both books not found' });
    }

    const swap = await Swap.create({
      requestedBook: requestedBookId,
      offeredBook: offeredBookId,
      requestedBy: req.user.id,
      status: 'pending',
    });

    res.status(201).json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find()
    .populate({
      path: 'requestedBook',
      populate: { path: 'userId', select: 'name _id' },
    })
    .populate({
      path: 'offeredBook',
      populate: { path: 'userId', select: 'name _id' },
    })
    .populate('requestedBy', 'name');

    // Convert _id fields to strings
    const formattedSwaps = swaps.map(swap => ({
      ...swap.toObject(),
      _id: swap._id.toString(),
      requestedBy: { ...swap.requestedBy.toObject(), _id: swap.requestedBy._id.toString() },
      requestedBook: {
        ...swap.requestedBook.toObject(),
        _id: swap.requestedBook._id.toString(),
        userId: swap.requestedBook.userId
          ? { ...swap.requestedBook.userId.toObject(), _id: swap.requestedBook.userId._id.toString() }
          : null
      },
      offeredBook: {
        ...swap.offeredBook.toObject(),
        _id: swap.offeredBook._id.toString(),
        userId: swap.offeredBook.userId
          ? { ...swap.offeredBook.userId.toObject(), _id: swap.offeredBook.userId._id.toString() }
          : null
      }
    }));

    res.json(formattedSwaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSwapStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    swap.status = status;
    const updatedSwap = await swap.save();

    res.json(updatedSwap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    // ✅ Ensure only the requesting user can delete their own swap
    if (String(swap.requestedBy) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this swap' });
    }

    await swap.deleteOne();
    res.json({ message: 'Swap cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSwapRequest,
  getUserSwaps,
  updateSwapStatus,
  deleteSwap,
};
