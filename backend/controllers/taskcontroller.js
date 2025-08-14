const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  console.log('Create Task Request Body:', req.body);

  if (!title || !description || !dueDate) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const task = new Task({
    user: req.user._id,
    title,
    description,
    dueDate,
  });

  try {
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500);
    throw new Error('Failed to save task');
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await task.remove();
  res.json({ message: 'Task removed' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
