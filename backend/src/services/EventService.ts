import prisma from '../utils/prisma';
import { MongoClient, ObjectId } from 'mongodb';

export class EventService {
  static async getAllEvents() {
    const events = await prisma.events.findMany({
      include: {
        venues: true,
        event_prices: true
      }
    });

    return events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      venueName: e.venues.name,
      venueId: e.venues.id,
      organiserId: e.organiser_id,
      eventDate: e.event_date,
      eventTime: e.event_time,
      status: e.status,
      prices: e.event_prices.map(p => ({
        category: p.category,
        price: p.price
      }))
    }));
  }

  static async createEvent(data: any, organiserId: string) {
    const { title, description, venueId, eventDate, eventTime, prices } = data;

    // Bypass Prisma transaction error for standalone MongoDB instances
    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();

    const eventId = new ObjectId();
    
    // Create event
    await db.collection('events').insertOne({
      _id: eventId,
      title,
      description,
      venue_id: new ObjectId(venueId),
      organiser_id: new ObjectId(organiserId),
      event_date: new Date(eventDate),
      event_time: new Date(`${eventDate}T${eventTime}`),
      status: 'UPCOMING',
      created_at: new Date(),
      updated_at: new Date()
    });

    if (prices && prices.length > 0) {
      await db.collection('event_prices').insertMany(prices.map((p: any) => ({
        _id: new ObjectId(),
        event_id: eventId,
        category: p.category,
        price: p.price,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }

    const venueSeats = await prisma.venue_seats.findMany({ where: { venue_id: venueId } });
    if (venueSeats.length > 0) {
      await db.collection('show_seats').insertMany(venueSeats.map(vs => ({
        _id: new ObjectId(),
        event_id: eventId,
        venue_seat_id: new ObjectId(vs.id),
        status: 'AVAILABLE',
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }

    await client.close();

    return { id: eventId.toString(), title, description, status: 'UPCOMING' };
  }

  static async getEventById(id: string) {
    const e = await prisma.events.findUnique({
      where: { id },
      include: { venues: true, event_prices: true }
    });

    if (!e) return null;

    return {
      id: e.id,
      title: e.title,
      description: e.description,
      venueName: e.venues.name,
      venueId: e.venues.id,
      organiserId: e.organiser_id,
      eventDate: e.event_date,
      eventTime: e.event_time,
      status: e.status,
      prices: e.event_prices.map((p: any) => ({
        category: p.category,
        price: p.price
      }))
    };
  }

  static async getEventSeats(id: string) {
    const seats = await prisma.show_seats.findMany({
      where: { event_id: id },
      include: { venue_seats: true }
    });

    return seats.map(s => ({
      id: s.id,
      seatNumber: s.venue_seats.seat_number,
      rowNumber: s.venue_seats.row_number,
      category: s.venue_seats.category,
      status: s.status,
      seatLabel: s.venue_seats.seat_label
    }));
  }
}
