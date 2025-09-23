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

    // Create admin users
    const admin = new User({
      name: 'Admin User',
      email: 'admin@propertymanagement.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();

    const admin2 = new User({
      name: 'Sarah Admin',
      email: 'sarah.admin@propertymanagement.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin2.save();

    // Create property owners
    const owner1 = new User({
      name: 'John Owner',
      email: 'owner@example.com',
      password: 'owner123',
      role: 'owner'
    });
    await owner1.save();

    const owner2 = new User({
      name: 'Maria Rodriguez',
      email: 'maria.owner@example.com',
      password: 'owner123',
      role: 'owner'
    });
    await owner2.save();

    const owner3 = new User({
      name: 'David Chen',
      email: 'david.owner@example.com',
      password: 'owner123',
      role: 'owner'
    });
    await owner3.save();

    // Create staff members
    const staff1 = new User({
      name: 'Mike Staff',
      email: 'mike.staff@example.com',
      password: 'staff123',
      role: 'staff'
    });
    await staff1.save();

    const staff2 = new User({
      name: 'Lisa Maintenance',
      email: 'lisa.staff@example.com',
      password: 'staff123',
      role: 'staff'
    });
    await staff2.save();

    // Create regular users
    const users = [
      { name: 'Jane Smith', email: 'jane@example.com', password: 'user123', role: 'guest' },
      { name: 'Bob Johnson', email: 'bob@example.com', password: 'user123', role: 'guest' },
      { name: 'Alice Brown', email: 'alice@example.com', password: 'user123', role: 'guest' },
      { name: 'Charlie Wilson', email: 'charlie@example.com', password: 'user123', role: 'guest' },
      { name: 'Emma Davis', email: 'emma@example.com', password: 'user123', role: 'guest' },
      { name: 'Frank Miller', email: 'frank@example.com', password: 'user123', role: 'guest' },
      { name: 'Grace Taylor', email: 'grace@example.com', password: 'user123', role: 'guest' },
      { name: 'Henry Anderson', email: 'henry@example.com', password: 'user123', role: 'guest' }
    ];

    const savedUsers = await User.insertMany(users);

    // Create properties
    const properties = [
      {
        name: 'Sunset Villa',
        description: 'Beautiful beachfront villa with stunning sunset views. Perfect for families and couples looking for a romantic getaway.',
        location: 'Miami Beach',
        address: '123 Ocean Drive, Miami Beach, FL',
        price: 299,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking', 'Beach Access', 'Air Conditioning', 'Balcony'],
        owner: owner1._id,
        rating: 4.8,
        isActive: true
      },
      {
        name: 'Ocean View Penthouse',
        description: 'Luxury penthouse with panoramic ocean views and premium amenities. Experience the ultimate in comfort and style.',
        location: 'Malibu',
        address: '456 Pacific Coast Highway, Malibu, CA',
        price: 450,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['Beach Access', 'Spa', 'Gym', 'Concierge', 'WiFi', 'Jacuzzi', 'Private Terrace'],
        owner: owner2._id,
        rating: 4.9,
        isActive: true
      },
      {
        name: 'Mountain Lodge',
        description: 'Cozy mountain retreat perfect for winter getaways. Enjoy skiing, hiking, and breathtaking mountain views.',
        location: 'Aspen',
        address: '789 Mountain View Road, Aspen, CO',
        price: 350,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        amenities: ['Fireplace', 'Ski Access', 'Hot Tub', 'Mountain View', 'WiFi', 'Game Room', 'Sauna'],
        owner: owner3._id,
        rating: 4.7,
        isActive: true
      },
      {
        name: 'Downtown Loft',
        description: 'Modern loft in the heart of the city. Walking distance to restaurants, shops, and entertainment.',
        location: 'New York City',
        address: '321 Broadway, New York, NY',
        price: 200,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['WiFi', 'Kitchen', 'Gym', 'Rooftop Access', 'Concierge', 'Air Conditioning'],
        owner: owner1._id,
        rating: 4.5,
        isActive: true
      },
      {
        name: 'Lakeside Cabin',
        description: 'Peaceful lakeside cabin surrounded by nature. Perfect for fishing, kayaking, and relaxation.',
        location: 'Lake Tahoe',
        address: '654 Lakeshore Drive, Lake Tahoe, CA',
        price: 180,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        amenities: ['Lake Access', 'Fireplace', 'Kayaks', 'Fishing Gear', 'WiFi', 'BBQ Grill'],
        owner: owner2._id,
        rating: 4.6,
        isActive: true
      },
      {
        name: 'Desert Oasis',
        description: 'Stunning desert retreat with pool and spa. Experience the beauty of the Southwest.',
        location: 'Scottsdale',
        address: '987 Desert View Lane, Scottsdale, AZ',
        price: 275,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['Pool', 'Spa', 'Desert View', 'WiFi', 'Outdoor Kitchen', 'Fire Pit'],
        owner: owner3._id,
        rating: 4.4,
        isActive: true
      },
      {
        name: 'Historic Brownstone',
        description: 'Charming historic brownstone with modern amenities. Experience old-world charm in the city.',
        location: 'Boston',
        address: '147 Beacon Street, Boston, MA',
        price: 220,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Garden', 'Parking', 'Historic Character'],
        owner: owner1._id,
        rating: 4.3,
        isActive: true
      },
      {
        name: 'Beachfront Condo',
        description: 'Modern beachfront condo with direct beach access. Wake up to the sound of waves.',
        location: 'San Diego',
        address: '258 Coastal Boulevard, San Diego, CA',
        price: 320,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['Beach Access', 'Pool', 'WiFi', 'Balcony', 'Gym', 'Parking'],
        owner: owner2._id,
        rating: 4.7,
        isActive: true
      }
    ];

    const savedProperties = await Property.insertMany(properties);

    // Create sample bookings with various statuses and dates
    const bookings = [
      {
        property: savedProperties[0]._id,
        user: savedUsers[0]._id,
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-20'),
        guests: 2,
        totalAmount: 1495,
        status: 'confirmed'
      },
      {
        property: savedProperties[1]._id,
        user: savedUsers[1]._id,
        checkIn: new Date('2024-03-10'),
        checkOut: new Date('2024-03-15'),
        guests: 4,
        totalAmount: 2250,
        status: 'pending'
      },
      {
        property: savedProperties[2]._id,
        user: savedUsers[2]._id,
        checkIn: new Date('2024-01-20'),
        checkOut: new Date('2024-01-25'),
        guests: 6,
        totalAmount: 1750,
        status: 'completed'
      },
      {
        property: savedProperties[3]._id,
        user: savedUsers[3]._id,
        checkIn: new Date('2024-04-01'),
        checkOut: new Date('2024-04-05'),
        guests: 2,
        totalAmount: 800,
        status: 'confirmed'
      },
      {
        property: savedProperties[4]._id,
        user: savedUsers[4]._id,
        checkIn: new Date('2024-02-28'),
        checkOut: new Date('2024-03-03'),
        guests: 4,
        totalAmount: 540,
        status: 'cancelled'
      },
      {
        property: savedProperties[5]._id,
        user: savedUsers[5]._id,
        checkIn: new Date('2024-03-20'),
        checkOut: new Date('2024-03-25'),
        guests: 6,
        totalAmount: 1375,
        status: 'confirmed'
      },
      {
        property: savedProperties[6]._id,
        user: savedUsers[6]._id,
        checkIn: new Date('2024-01-10'),
        checkOut: new Date('2024-01-15'),
        guests: 4,
        totalAmount: 1100,
        status: 'completed'
      },
      {
        property: savedProperties[7]._id,
        user: savedUsers[7]._id,
        checkIn: new Date('2024-05-01'),
        checkOut: new Date('2024-05-07'),
        guests: 4,
        totalAmount: 1920,
        status: 'pending'
      }
    ];

    await Booking.insertMany(bookings);

    // Create housekeeping tasks
    const housekeepingTasks = [
      {
        property: savedProperties[0]._id,
        room: 'Master Bedroom',
        task: 'Deep Clean',
        status: 'pending',
        priority: 'high',
        assignee: staff1._id,
        scheduledDate: new Date('2024-01-15'),
        notes: 'Guest checkout - full cleaning required'
      },
      {
        property: savedProperties[1]._id,
        room: 'Living Room',
        task: 'Maintenance Check',
        status: 'in-progress',
        priority: 'medium',
        assignee: staff2._id,
        scheduledDate: new Date('2024-01-15'),
        notes: 'Weekly maintenance inspection'
      },
      {
        property: savedProperties[2]._id,
        room: 'Kitchen',
        task: 'Appliance Cleaning',
        status: 'completed',
        priority: 'low',
        assignee: staff1._id,
        scheduledDate: new Date('2024-01-12'),
        notes: 'Monthly deep clean of all appliances'
      },
      {
        property: savedProperties[3]._id,
        room: 'Bathroom',
        task: 'Sanitization',
        status: 'pending',
        priority: 'high',
        assignee: staff2._id,
        scheduledDate: new Date('2024-01-16'),
        notes: 'Pre-arrival sanitization'
      },
      {
        property: savedProperties[4]._id,
        room: 'Entire Property',
        task: 'Inventory Check',
        status: 'in-progress',
        priority: 'medium',
        assignee: staff1._id,
        scheduledDate: new Date('2024-01-14'),
        notes: 'Monthly inventory and supplies check'
      }
    ];

    await Housekeeping.insertMany(housekeepingTasks);

    // Create maintenance requests
    const maintenanceRequests = [
      {
        property: savedProperties[0]._id,
        issue: 'AC Not Working',
        description: 'Air conditioning unit in master bedroom not cooling properly',
        priority: 'urgent',
        status: 'assigned',
        technician: staff2._id,
        estimatedCost: 250,
        scheduledDate: new Date('2024-01-15'),
        reportedBy: savedUsers[0]._id
      },
      {
        property: savedProperties[1]._id,
        issue: 'Leaky Faucet',
        description: 'Kitchen faucet has a persistent drip',
        priority: 'medium',
        status: 'pending',
        estimatedCost: 100,
        scheduledDate: new Date('2024-01-16'),
        reportedBy: owner2._id
      },
      {
        property: savedProperties[2]._id,
        issue: 'Broken Window',
        description: 'Living room window latch is broken',
        priority: 'high',
        status: 'in-progress',
        technician: staff1._id,
        estimatedCost: 150,
        scheduledDate: new Date('2024-01-14'),
        reportedBy: savedUsers[2]._id
      },
      {
        property: savedProperties[3]._id,
        issue: 'Electrical Outlet',
        description: 'Bedroom outlet not working',
        priority: 'medium',
        status: 'completed',
        technician: staff2._id,
        estimatedCost: 75,
        actualCost: 80,
        scheduledDate: new Date('2024-01-10'),
        completedDate: new Date('2024-01-11'),
        reportedBy: owner1._id
      },
      {
        property: savedProperties[4]._id,
        issue: 'Plumbing Issue',
        description: 'Low water pressure in shower',
        priority: 'medium',
        status: 'assigned',
        technician: staff1._id,
        estimatedCost: 200,
        scheduledDate: new Date('2024-01-17'),
        reportedBy: savedUsers[4]._id
      },
      {
        property: savedProperties[5]._id,
        issue: 'Pool Maintenance',
        description: 'Pool filter needs replacement',
        priority: 'low',
        status: 'pending',
        estimatedCost: 120,
        scheduledDate: new Date('2024-01-20'),
        reportedBy: owner3._id
      }
    ];

    await Maintenance.insertMany(maintenanceRequests);

    console.log('Comprehensive seed data created successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@propertymanagement.com / admin123');
    console.log('Admin: sarah.admin@propertymanagement.com / admin123');
    console.log('Owner: owner@example.com / owner123');
    console.log('Owner: maria.owner@example.com / owner123');
    console.log('Owner: david.owner@example.com / owner123');
    console.log('Staff: mike.staff@example.com / staff123');
    console.log('Staff: lisa.staff@example.com / staff123');
    console.log('User: jane@example.com / user123');
    console.log('User: bob@example.com / user123');
    console.log('\n=== DATA SUMMARY ===');
    console.log(`Users: ${2 + 3 + 2 + 8} (2 admins, 3 owners, 2 staff, 8 guests)`);
    console.log(`Properties: ${savedProperties.length}`);
    console.log(`Bookings: ${bookings.length}`);
    console.log(`Housekeeping Tasks: ${housekeepingTasks.length}`);
    console.log(`Maintenance Requests: ${maintenanceRequests.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
