const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  room: String,
  task: { type: String, required: true },
  description: String,
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  scheduledDate: Date,
  completedDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Housekeeping', housekeepingSchema);
