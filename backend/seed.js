const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Housekeeping = require('./models/Housekeeping');
const Maintenance = require('./models/Maintenance');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-management');
    
    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Housekeeping.deleteMany({});
    await Maintenance.deleteMany({});

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@propertymanagement.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();

    // Create property owner
    const owner = new User({
      name: 'John Owner',
      email: 'owner@example.com',
      password: 'owner123',
      role: 'owner'
    });
    await owner.save();

    // Create regular users
    const user1 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123',
      role: 'user'
    });
    await user1.save();

    const user2 = new User({
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: 'user123',
      role: 'user'
    });
    await user2.save();

    // Create properties
    const properties = [
      {
        name: 'Sunset Villa',
        description: 'Beautiful beachfront villa with stunning sunset views',
        location: 'Miami Beach',
        address: '123 Ocean Drive, Miami Beach, FL',
        price: 299,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking', 'Beach Access'],
        owner: owner._id,
        rating: 4.8
      },
      {
        name: 'Ocean View Penthouse',
        description: 'Luxury penthouse with panoramic ocean views',
        location: 'Malibu',
        address: '456 Pacific Coast Highway, Malibu, CA',
        price: 450,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['Beach Access', 'Spa', 'Gym', 'Concierge', 'WiFi'],
        owner: owner._id,
        rating: 4.9
      },
      {
        name: 'Mountain Lodge',
        description: 'Cozy mountain retreat perfect for winter getaways',
        location: 'Aspen',
        address: '789 Mountain View Road, Aspen, CO',
        price: 350,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        amenities: ['Fireplace', 'Ski Access', 'Hot Tub', 'Mountain View', 'WiFi'],
        owner: owner._id,
        rating: 4.7
      }
    ];

    const savedProperties = await Property.insertMany(properties);

    // Create sample bookings
    const bookings = [
      {
        property: savedProperties[0]._id,
        user: user1._id,
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-20'),
        guests: 2,
        totalAmount: 1495,
        status: 'confirmed'
      },
      {
        property: savedProperties[1]._id,
        user: user2._id,
        checkIn: new Date('2024-03-10'),
        checkOut: new Date('2024-03-15'),
        guests: 4,
        totalAmount: 2250,
        status: 'pending'
      }
    ];

    await Booking.insertMany(bookings);

    // Create housekeeping tasks
    const housekeepingTasks = [
      {
        property: savedProperties[0]._id,
        room: 'Room 101',
        task: 'Deep Clean',
        status: 'pending',
        priority: 'high',
        assignee: user1._id,
        scheduledDate: new Date('2024-01-15')
      },
      {
        property: savedProperties[1]._id,
        room: 'Room 205',
        task: 'Maintenance Check',
        status: 'in-progress',
        priority: 'medium',
        assignee: user2._id,
        scheduledDate: new Date('2024-01-15')
      }
    ];

    await Housekeeping.insertMany(housekeepingTasks);

    // Create maintenance requests
    const maintenanceRequests = [
      {
        property: savedProperties[0]._id,
        issue: 'AC Not Working',
        priority: 'urgent',
        status: 'assigned',
        technician: user1._id,
        estimatedCost: 250,
        scheduledDate: new Date('2024-01-15')
      },
      {
        property: savedProperties[1]._id,
        issue: 'Leaky Faucet',
        priority: 'medium',
        status: 'pending',
        estimatedCost: 100,
        scheduledDate: new Date('2024-01-14')
      }
    ];

    await Maintenance.insertMany(maintenanceRequests);

    console.log('Seed data created successfully!');
    console.log('Admin login: admin@propertymanagement.com / admin123');
    console.log('Owner login: owner@example.com / owner123');
    console.log('User login: jane@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
