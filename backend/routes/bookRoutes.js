const express = require('express');
const { getBooks, addBook, updateBook, deleteBook, getAllBooks } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const Book = require('../models/Book');
const router = express.Router();

router.route('/')
  .get(protect, getBooks)
  .post(protect, addBook);

router.route('/all')
  .get(getAllBooks);

router.route('/:id')
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
