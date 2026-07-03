const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ticket_booking');

    const rolesCol = db.collection('roles');
    const usersCol = db.collection('users');
    const venuesCol = db.collection('venues');
    const venueSeatsCol = db.collection('venue_seats');

    // Clear existing data (optional)
    await rolesCol.deleteMany({});
    await usersCol.deleteMany({});
    await venuesCol.deleteMany({});
    await venueSeatsCol.deleteMany({});

    const now = new Date();

    // Roles
    const { insertedId: adminRoleId } = await rolesCol.insertOne({ name: 'ADMIN', created_at: now, updated_at: now });
    const { insertedId: orgRoleId } = await rolesCol.insertOne({ name: 'ORGANISER', created_at: now, updated_at: now });
    const { insertedId: custRoleId } = await rolesCol.insertOne({ name: 'CUSTOMER', created_at: now, updated_at: now });

    // Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    await usersCol.insertOne({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role_id: adminRoleId,
      created_at: now,
      updated_at: now
    });

    const orgPassword = await bcrypt.hash('org123', 10);
    await usersCol.insertOne({
      first_name: 'John',
      last_name: 'Organiser',
      email: 'org@example.com',
      password: orgPassword,
      role_id: orgRoleId,
      created_at: now,
      updated_at: now
    });

    const custPassword = await bcrypt.hash('cust123', 10);
    await usersCol.insertOne({
      first_name: 'Jane',
      last_name: 'Customer',
      email: 'cust@example.com',
      password: custPassword,
      role_id: custRoleId,
      created_at: now,
      updated_at: now
    });

    // Venues
    const { insertedId: venueId } = await venuesCol.insertOne({
      name: 'Grand Arena',
      address: '123 Main St',
      city: 'Metropolis',
      state: 'NY',
      capacity: 100,
      created_at: now,
      updated_at: now
    });

    // Venue Seats
    const seats = [];
    ['A', 'B', 'C'].forEach((rowLabel) => {
      for (let i = 1; i <= 10; i++) {
        seats.push({
          venue_id: venueId,
          category: rowLabel === 'A' ? 'PREMIUM' : 'STANDARD',
          seat_label: `${rowLabel}${i}`,
          row_number: rowLabel,
          seat_number: i,
          created_at: now,
          updated_at: now
        });
      }
    });
    await venueSeatsCol.insertMany(seats);

    console.log('Seed completed successfully via raw MongoDB driver!');
  } finally {
    await client.close();
  }
}

main().catch(console.error);
