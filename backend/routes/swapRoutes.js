const express = require('express');
const {
  createSwapRequest,
  getUserSwaps,
  updateSwapStatus,
  deleteSwap,
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createSwapRequest)   
  .get(protect, getUserSwaps);        

router.route('/:id')
  .patch(protect, updateSwapStatus)   
  .delete(protect, deleteSwap);       

module.exports = router;
