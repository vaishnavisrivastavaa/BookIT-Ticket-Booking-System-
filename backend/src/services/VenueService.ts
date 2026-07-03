import prisma from '../utils/prisma';
import { MongoClient, ObjectId } from 'mongodb';

export class VenueService {
  static async createVenue(data: any, adminId: number) {
    const { name, address, city, state, seats } = data;

    // Generate seats
    const venueSeatsToCreate = [];
    for (const seatConfig of seats) {
      for (let i = 1; i <= seatConfig.seatCount; i++) {
        venueSeatsToCreate.push({
          seat_label: `${seatConfig.rowPrefix}${i}`,
          seat_number: i,
          row_number: seatConfig.rowPrefix,
          category: seatConfig.category,
        });
      }
    }

    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();

    const venueResult = await db.collection('venues').insertOne({
      name,
      address,
      city,
      state,
      capacity: venueSeatsToCreate.length,
      created_at: new Date(),
      updated_at: new Date()
    });

    const venueId = venueResult.insertedId.toString();

    const seatsWithVenue = venueSeatsToCreate.map(seat => ({
      ...seat,
      venue_id: { $oid: venueId }, // Keep Prisma ObjectId relationship format
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Convert string venue_id to ObjectId for MongoDB natively
    const mongoSeats = seatsWithVenue.map(s => ({
      ...s,
      venue_id: new ObjectId(venueId)
    }));

    await db.collection('venue_seats').insertMany(mongoSeats);
    await client.close();

    return {
      id: venueId,
      name,
      address,
      city,
      state,
      totalCapacity: venueSeatsToCreate.length
    };
  }

  static async getAllVenues() {
    const venues = await prisma.venues.findMany();
    return venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      totalCapacity: venue.capacity
    }));
  }
}
