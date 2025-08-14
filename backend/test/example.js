const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Task = require('../models/Task');
const { updateTask, getTasks, createTask, deleteTask } = require('../controllers/taskController');
const { expect } = chai;

chai.use(chaiHttp);

describe('AddTask Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a new task successfully', async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { 
        title: "New Task", 
        description: "Task description", 
        dueDate: "2025-12-31" 
      }
    };

    const createdTask = { 
      _id: new mongoose.Types.ObjectId(), 
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate)
    };

    const saveStub = sinon.stub(Task.prototype, 'save').resolves(createdTask);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createTask(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdTask)).to.be.true;
  });

  it('should return 400 if fields are missing', async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { title: "New Task" }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    try {
      await createTask(req, res);
    } catch (error) {
      expect(res.status.calledWith(400)).to.be.true;
      expect(error.message).to.equal('Please add all fields');
    }
  });

  it('should return 500 if an error occurs', async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { 
        title: "New Task", 
        description: "Task description", 
        dueDate: "2025-12-31" 
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    sinon.stub(Task.prototype, 'save').rejects(new Error('DB Error'));

    try {
      await createTask(req, res);
    } catch (error) {
      expect(error.message).to.equal('DB Error');
    }
  });
});

describe('Update Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should update task successfully', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    const existingTask = {
      _id: taskId,
      user: userId,
      title: "Old Task",
      description: "Old Description",
      dueDate: new Date()
    };

    const findByIdStub = sinon.stub(Task, 'findById').resolves(existingTask);
    
    const updatedTask = {
      _id: taskId,
      user: userId,
      title: "Updated Task",
      description: "Updated Description",
      dueDate: new Date()
    };
    const findByIdAndUpdateStub = sinon.stub(Task, 'findByIdAndUpdate').resolves(updatedTask);

    const req = {
      user: { _id: userId },
      params: { id: taskId.toString() },
      body: { title: "Updated Task", description: "Updated Description" }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    await updateTask(req, res);

    expect(findByIdAndUpdateStub.calledOnce).to.be.true;
    expect(res.json.calledWith(updatedTask)).to.be.true;
  });

  it('should return 404 if task is not found', async () => {
    const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

    const req = { 
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId().toString() }, 
      body: {} 
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    try {
      await updateTask(req, res);
    } catch (error) {
      expect(res.status.calledWith(404)).to.be.true;
      expect(error.message).to.equal('Task not found');
    }
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

    const req = { 
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId().toString() }, 
      body: {} 
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    try {
      await updateTask(req, res);
    } catch (error) {
      expect(error.message).to.equal('DB Error');
    }
  });
});

describe('GetTask Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return tasks for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const tasks = [
      { _id: new mongoose.Types.ObjectId(), title: "Task 1", user: userId },
      { _id: new mongoose.Types.ObjectId(), title: "Task 2", user: userId }
    ];

    const findStub = sinon.stub(Task, 'find').resolves(tasks);

    const req = { user: { _id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getTasks(req, res);

    expect(findStub.calledOnceWith({ user: userId })).to.be.true;
    expect(res.json.calledWith(tasks)).to.be.true;
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Task, 'find').throws(new Error('DB Error'));

    const req = { user: { _id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    try {
      await getTasks(req, res);
    } catch (error) {
      expect(error.message).to.equal('DB Error');
    }
  });
});

describe('DeleteTask Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete a task successfully', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    const task = {
      _id: taskId,
      user: userId,
      remove: sinon.stub().resolves()
    };

    const findByIdStub = sinon.stub(Task, 'findById').resolves(task);

    const req = { 
      user: { _id: userId },
      params: { id: taskId.toString() } 
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteTask(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(task.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Task removed' })).to.be.true;
  });

  it('should return 404 if task is not found', async () => {
    const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

    const req = { 
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId().toString() } 
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    try {
      await deleteTask(req, res);
    } catch (error) {
      expect(res.status.calledWith(404)).to.be.true;
      expect(error.message).to.equal('Task not found');
    }
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

    const req = { 
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId().toString() } 
    };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    try {
      await deleteTask(req, res);
    } catch (error) {
      expect(error.message).to.equal('DB Error');
    }
  });
});
