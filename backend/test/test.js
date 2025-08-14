
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
//const Task = require('../models/Task');
const Book = require('../models/Book');
const Swap = require('../models/Swap');
const {
  getBooks,
  getAllBooks,
  addBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { createSwapRequest,getUserSwaps,updateSwapStatus,deleteSwap } = require('../controllers/swapController');
//const { updateTask,getTasks,addTask,deleteTask } = require('../controllers/taskController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

describe('getBooks Function Test', () => {
  it('should return books for the user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const books = [{ title: 'Book 1', userId }, { title: 'Book 2', userId }];

    const findStub = sinon.stub(Book, 'find').resolves(books);

    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getBooks(req, res);

    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(books)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Book, 'find').throws(new Error('DB Error'));

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getBooks(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });
});

describe('getAllBooks Function Test', () => {
  it('should return all books with user info', async () => {
    const books = [{ title: 'Book 1', userId: { name: 'Alice' } }];

    const findStub = sinon.stub(Book, 'find').returns({
      populate: sinon.stub().resolves(books)
    });

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getAllBooks(req, res);

    expect(res.json.calledWith(books)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Book, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getAllBooks(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });
});

describe('addBook Function Test', () => {
  it('should add a new book successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const bookData = {
      title: 'New Book',
      author: 'Author Name',
      publishedDate: '2025-01-01',
      genre: 'Fiction',
      availability: true
    };

    const createdBook = { _id: new mongoose.Types.ObjectId(), ...bookData, userId };

    const createStub = sinon.stub(Book, 'create').resolves(createdBook);

    const req = { user: { id: userId }, body: bookData };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addBook(req, res);

    expect(createStub.calledOnceWith({ userId, ...bookData })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdBook)).to.be.true;

    createStub.restore();
  });

  it('should return 500 on error', async () => {
    const createStub = sinon.stub(Book, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        title: 'New Book',
        author: 'Author Name',
        publishedDate: '2025-01-01',
        genre: 'Fiction'
      }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addBook(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });
});

describe('updateBook Function Test', () => {
  it('should update book successfully', async () => {
    const bookId = new mongoose.Types.ObjectId();
    const book = {
      _id: bookId,
      title: 'Old Title',
      author: 'Old Author',
      publishedDate: '2020-01-01',
      genre: 'Old Genre',
      availability: true,
      save: sinon.stub().resolvesThis()
    };

    const findByIdStub = sinon.stub(Book, 'findById').resolves(book);

    const req = {
      params: { id: bookId.toString() },
      body: {
        title: 'New Title',
        author: 'New Author',
        availability: false
      }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateBook(req, res);

    expect(book.title).to.equal('New Title');
    expect(book.author).to.equal('New Author');
    expect(book.availability).to.equal(false);
    expect(res.json.calledWith(book)).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if book not found', async () => {
    const findByIdStub = sinon.stub(Book, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateBook(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Book not found' })).to.be.true;

    findByIdStub.restore();
  });
});

describe('deleteBook Function Test', () => {
  it('should delete book successfully', async () => {
    const book = {
      _id: new mongoose.Types.ObjectId(),
      remove: sinon.stub().resolves()
    };

    const findByIdStub = sinon.stub(Book, 'findById').resolves(book);

    const req = { params: { id: book._id.toString() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await deleteBook(req, res);

    expect(book.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Book deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if book not found', async () => {
    const findByIdStub = sinon.stub(Book, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteBook(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Book not found' })).to.be.true;

    findByIdStub.restore();
  });
});


describe('createSwapRequest Function Test', () => {
  it('should create a swap request successfully', async () => {
    const requestedBookId = new mongoose.Types.ObjectId();
    const offeredBookId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const requestedBook = { _id: requestedBookId };
    const offeredBook = { _id: offeredBookId };
    const swap = { _id: new mongoose.Types.ObjectId(), requestedBook: requestedBookId, offeredBook: offeredBookId, requestedBy: userId, status: 'pending' };

    const findByIdStub = sinon.stub(Book, 'findById');
    findByIdStub.withArgs(requestedBookId).resolves(requestedBook);
    findByIdStub.withArgs(offeredBookId).resolves(offeredBook);

    const createStub = sinon.stub(Swap, 'create').resolves(swap);

    const req = {
      user: { id: userId },
      body: { requestedBookId, offeredBookId }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createSwapRequest(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(swap)).to.be.true;

    findByIdStub.restore();
    createStub.restore();
  });

  it('should return 404 if books not found', async () => {
    const findByIdStub = sinon.stub(Book, 'findById').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        requestedBookId: new mongoose.Types.ObjectId(),
        offeredBookId: new mongoose.Types.ObjectId()
      }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createSwapRequest(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'One or both books not found' })).to.be.true;

    findByIdStub.restore();
  });
});

describe('getUserSwaps Function Test', () => {
  it('should return populated swap data', async () => {
    const swap = {
      _id: new mongoose.Types.ObjectId(),
      requestedBook: {
        _id: new mongoose.Types.ObjectId(),
        userId: { _id: new mongoose.Types.ObjectId(), name: 'Alice', toObject: function () { return this; } },
        toObject: function () { return this; }
      },
      offeredBook: {
        _id: new mongoose.Types.ObjectId(),
        userId: { _id: new mongoose.Types.ObjectId(), name: 'Bob', toObject: function () { return this; } },
        toObject: function () { return this; }
      },
      requestedBy: { _id: new mongoose.Types.ObjectId(), name: 'Charlie', toObject: function () { return this; } },
      toObject: function () { return this; }
    };

    const findStub = sinon.stub(Swap, 'find').returns({
      populate: sinon.stub().returnsThis(),
      populate: sinon.stub().returnsThis(),
      populate: sinon.stub().resolves([swap])
    });

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getUserSwaps(req, res);

    expect(res.json.calledOnce).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Swap, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getUserSwaps(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });
});

describe('updateSwapStatus Function Test', () => {
  it('should update swap status successfully', async () => {
    const swap = {
      _id: new mongoose.Types.ObjectId(),
      status: 'pending',
      save: sinon.stub().resolvesThis()
    };

    const findByIdStub = sinon.stub(Swap, 'findById').resolves(swap);

    const req = {
      params: { id: swap._id.toString() },
      body: { status: 'accepted' }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateSwapStatus(req, res);

    expect(swap.status).to.equal('accepted');
    expect(res.json.calledWith(swap)).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if swap not found', async () => {
    const findByIdStub = sinon.stub(Swap, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: { status: 'accepted' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateSwapStatus(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Swap not found' })).to.be.true;

    findByIdStub.restore();
  });
});

describe('deleteSwap Function Test', () => {
  it('should delete swap if user is authorized', async () => {
    const userId = new mongoose.Types.ObjectId();
    const swap = {
      _id: new mongoose.Types.ObjectId(),
      requestedBy: userId.toString(),
      deleteOne: sinon.stub().resolves()
    };

    const findByIdStub = sinon.stub(Swap, 'findById').resolves(swap);

    const req = { params: { id: swap._id.toString() }, user: { id: userId.toString() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await deleteSwap(req, res);

    expect(swap.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Swap cancelled successfully' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if user is not authorized', async () => {
    const swap = {
      _id: new mongoose.Types.ObjectId(),
      requestedBy: new mongoose.Types.ObjectId().toString()
    };

    const findByIdStub = sinon.stub(Swap, 'findById').resolves(swap);

    const req = { params: { id: swap._id.toString() }, user: { id: new mongoose.Types.ObjectId().toString() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteSwap(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Not authorized to cancel this swap' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if swap not found', async () => {
    const findByIdStub = sinon.stub(Swap, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: new mongoose.Types.ObjectId().toString() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteSwap(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Swap not found' })).to.be.true;

    findByIdStub.restore();
  });
});


// describe('AddTask Function Test', () => {

//   it('should create a new task successfully', async () => {
//     // Mock request data
//     const req = {
//       user: { id: new mongoose.Types.ObjectId() },
//       body: { title: "New Task", description: "Task description", deadline: "2025-12-31" }
//     };

//     // Mock task that would be created
//     const createdTask = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

//     // Stub Task.create to return the createdTask
//     const createStub = sinon.stub(Task, 'create').resolves(createdTask);

//     // Mock response object
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     // Call function
//     await addTask(req, res);

//     // Assertions
//     expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
//     expect(res.status.calledWith(201)).to.be.true;
//     expect(res.json.calledWith(createdTask)).to.be.true;

//     // Restore stubbed methods
//     createStub.restore();
//   });

//   it('should return 500 if an error occurs', async () => {
//     // Stub Task.create to throw an error
//     const createStub = sinon.stub(Task, 'create').throws(new Error('DB Error'));

//     // Mock request data
//     const req = {
//       user: { id: new mongoose.Types.ObjectId() },
//       body: { title: "New Task", description: "Task description", deadline: "2025-12-31" }
//     };

//     // Mock response object
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     // Call function
//     await addTask(req, res);

//     // Assertions
//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

//     // Restore stubbed methods
//     createStub.restore();
//   });

// });


// describe('Update Function Test', () => {

//   it('should update task successfully', async () => {
//     // Mock task data
//     const taskId = new mongoose.Types.ObjectId();
//     const existingTask = {
//       _id: taskId,
//       title: "Old Task",
//       description: "Old Description",
//       completed: false,
//       deadline: new Date(),
//       save: sinon.stub().resolvesThis(), // Mock save method
//     };
//     // Stub Task.findById to return mock task
//     const findByIdStub = sinon.stub(Task, 'findById').resolves(existingTask);

//     // Mock request & response
//     const req = {
//       params: { id: taskId },
//       body: { title: "New Task", completed: true }
//     };
//     const res = {
//       json: sinon.spy(), 
//       status: sinon.stub().returnsThis()
//     };

//     // Call function
//     await updateTask(req, res);

//     // Assertions
//     expect(existingTask.title).to.equal("New Task");
//     expect(existingTask.completed).to.equal(true);
//     expect(res.status.called).to.be.false; // No error status should be set
//     expect(res.json.calledOnce).to.be.true;

//     // Restore stubbed methods
//     findByIdStub.restore();
//   });



//   it('should return 404 if task is not found', async () => {
//     const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

//     const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     await updateTask(req, res);

//     expect(res.status.calledWith(404)).to.be.true;
//     expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;

//     findByIdStub.restore();
//   });

//   it('should return 500 on error', async () => {
//     const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

//     const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     await updateTask(req, res);

//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.called).to.be.true;

//     findByIdStub.restore();
//   });



// });



// describe('GetTask Function Test', () => {

//   it('should return tasks for the given user', async () => {
//     // Mock user ID
//     const userId = new mongoose.Types.ObjectId();

//     // Mock task data
//     const tasks = [
//       { _id: new mongoose.Types.ObjectId(), title: "Task 1", userId },
//       { _id: new mongoose.Types.ObjectId(), title: "Task 2", userId }
//     ];

//     // Stub Task.find to return mock tasks
//     const findStub = sinon.stub(Task, 'find').resolves(tasks);

//     // Mock request & response
//     const req = { user: { id: userId } };
//     const res = {
//       json: sinon.spy(),
//       status: sinon.stub().returnsThis()
//     };

//     // Call function
//     await getTasks(req, res);

//     // Assertions
//     expect(findStub.calledOnceWith({ userId })).to.be.true;
//     expect(res.json.calledWith(tasks)).to.be.true;
//     expect(res.status.called).to.be.false; // No error status should be set

//     // Restore stubbed methods
//     findStub.restore();
//   });

//   it('should return 500 on error', async () => {
//     // Stub Task.find to throw an error
//     const findStub = sinon.stub(Task, 'find').throws(new Error('DB Error'));

//     // Mock request & response
//     const req = { user: { id: new mongoose.Types.ObjectId() } };
//     const res = {
//       json: sinon.spy(),
//       status: sinon.stub().returnsThis()
//     };

//     // Call function
//     await getTasks(req, res);

//     // Assertions
//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

//     // Restore stubbed methods
//     findStub.restore();
//   });

// });



// describe('DeleteTask Function Test', () => {

//   it('should delete a task successfully', async () => {
//     // Mock request data
//     const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

//     // Mock task found in the database
//     const task = { remove: sinon.stub().resolves() };

//     // Stub Task.findById to return the mock task
//     const findByIdStub = sinon.stub(Task, 'findById').resolves(task);

//     // Mock response object
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     // Call function
//     await deleteTask(req, res);

//     // Assertions
//     expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
//     expect(task.remove.calledOnce).to.be.true;
//     expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;

//     // Restore stubbed methods
//     findByIdStub.restore();
//   });

//   it('should return 404 if task is not found', async () => {
//     // Stub Task.findById to return null
//     const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

//     // Mock request data
//     const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

//     // Mock response object
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     // Call function
//     await deleteTask(req, res);

//     // Assertions
//     expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
//     expect(res.status.calledWith(404)).to.be.true;
//     expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;

//     // Restore stubbed methods
//     findByIdStub.restore();
//   });

//   it('should return 500 if an error occurs', async () => {
//     // Stub Task.findById to throw an error
//     const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

//     // Mock request data
//     const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

//     // Mock response object
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy()
//     };

//     // Call function
//     await deleteTask(req, res);

//     // Assertions
//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

//     // Restore stubbed methods
//     findByIdStub.restore();
//   });

// });