const express = require('express');
const Maintenance = require('../models/Maintenance');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all maintenance requests
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { status, priority, property } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (property) query.property = property;

    const requests = await Maintenance.find(query)
      .populate('property', 'name location')
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create maintenance request
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const request = new Maintenance(req.body);
    await request.save();
    await request.populate('property', 'name location');
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update maintenance request
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Allow technician to update or admin
    if (req.user.role !== 'admin' && request.technician?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(request, req.body);
    if (req.body.status === 'completed') {
      request.completedDate = new Date();
    }
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete maintenance request
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maintenance stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalRequests = await Maintenance.countDocuments();
    const pendingRequests = await Maintenance.countDocuments({ status: 'pending' });
    const inProgressRequests = await Maintenance.countDocuments({ status: 'in-progress' });
    const completedRequests = await Maintenance.countDocuments({ status: 'completed' });
    
    const totalCost = await Maintenance.aggregate([
      { $match: { actualCost: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$actualCost' } } }
    ]);

    res.json({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      totalCost: totalCost[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
