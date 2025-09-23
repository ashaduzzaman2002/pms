const express = require('express');
const Housekeeping = require('../models/Housekeeping');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all housekeeping tasks
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { status, priority, property } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (property) query.property = property;

    const tasks = await Housekeeping.find(query)
      .populate('property', 'name location')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create housekeeping task
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const task = new Housekeeping(req.body);
    await task.save();
    await task.populate('property', 'name location');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update housekeeping task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Housekeeping.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow assignee to update or admin
    if (req.user.role !== 'admin' && task.assignee?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(task, req.body);
    if (req.body.status === 'completed') {
      task.completedDate = new Date();
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete housekeeping task
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Housekeeping.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
