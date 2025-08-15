const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  return res.json(tasks);
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  console.log('Create Task Request Body:', req.body);

  if (!title || !description || !dueDate) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const task = new Task({
    user: req.user._id,
    title,
    description,
    dueDate,
  });

 try {
  const createdTask = await task.save();
  return res.status(201).json(createdTask);
} catch (error) {
  console.error('Error saving task:', error);
  // Important: return JSON with the real error message
  return res.status(500).json({ message: error.message || 'Server error' });
}
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  return res.json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  await task.remove();
  return res.json({ message: 'Task removed' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
