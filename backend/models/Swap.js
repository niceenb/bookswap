const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requestedBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Swap', swapSchema);
