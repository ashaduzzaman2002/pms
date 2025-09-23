const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  issue: { type: String, required: true },
  description: String,
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedCost: Number,
  actualCost: Number,
  scheduledDate: Date,
  completedDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
