const express = require('express');
const multer = require('multer');
const path = require('path');
const Property = require('../models/Property');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice, guests } = req.query;
    let query = { isActive: true };
    
    if (location) query.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (guests) query.maxGuests = { $gte: Number(guests) };

    const properties = await Property.find(query).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create property with images
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const propertyData = { ...req.body, owner: req.user._id };
    
    // Handle amenities array from form data
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        propertyData.amenities = req.body.amenities;
      } else if (typeof req.body.amenities === 'string') {
        try {
          propertyData.amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          propertyData.amenities = req.body.amenities.split(',').map(a => a.trim()).filter(Boolean);
        }
      }
    }
    
    // Convert form data arrays (amenities[0], amenities[1], etc.) to proper array
    const amenitiesArray = [];
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('amenities[') && key.endsWith(']')) {
        amenitiesArray.push(req.body[key]);
      }
    });
    if (amenitiesArray.length > 0) {
      propertyData.amenities = amenitiesArray;
    }
    
    // Add uploaded image paths
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const property = new Property(propertyData);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update property
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    // Handle amenities array from form data
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        updateData.amenities = req.body.amenities;
      } else if (typeof req.body.amenities === 'string') {
        try {
          updateData.amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          updateData.amenities = req.body.amenities.split(',').map(a => a.trim()).filter(Boolean);
        }
      }
    }
    
    // Convert form data arrays (amenities[0], amenities[1], etc.) to proper array
    const amenitiesArray = [];
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('amenities[') && key.endsWith(']')) {
        amenitiesArray.push(req.body[key]);
      }
    });
    if (amenitiesArray.length > 0) {
      updateData.amenities = amenitiesArray;
    }

    // Update property data
    Object.assign(property, updateData);
    
    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      property.images = [...(property.images || []), ...newImages];
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
