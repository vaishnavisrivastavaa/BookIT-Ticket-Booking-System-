const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const adminRole = await prisma.roles.create({ data: { name: 'ADMIN' } });
  const orgRole = await prisma.roles.create({ data: { name: 'ORGANISER' } });
  const custRole = await prisma.roles.create({ data: { name: 'CUSTOMER' } });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.users.create({
    data: {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role_id: adminRole.id
    }
  });

  const orgPassword = await bcrypt.hash('org123', 10);
  const org = await prisma.users.create({
    data: {
      first_name: 'John',
      last_name: 'Organiser',
      email: 'org@example.com',
      password: orgPassword,
      role_id: orgRole.id
    }
  });

  const custPassword = await bcrypt.hash('cust123', 10);
  const cust = await prisma.users.create({
    data: {
      first_name: 'Jane',
      last_name: 'Customer',
      email: 'cust@example.com',
      password: custPassword,
      role_id: custRole.id
    }
  });

  const venue = await prisma.venues.create({
    data: {
      name: 'Grand Arena',
      address: '123 Main St',
      city: 'Metropolis',
      state: 'NY',
      capacity: 100
    }
  });

  // Create some venue seats
  const seats = [];
  ['A', 'B', 'C'].forEach((rowLabel) => {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        venue_id: venue.id,
        category: rowLabel === 'A' ? 'PREMIUM' : 'STANDARD',
        seat_label: `${rowLabel}${i}`,
        row_number: rowLabel,
        seat_number: i
      });
    }
  });
  await prisma.venue_seats.createMany({ data: seats });

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
