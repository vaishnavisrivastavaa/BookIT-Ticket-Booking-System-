require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.DATABASE_URL;

async function fixBookings() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const bookings = await db.collection('bookings').find({}).toArray();
  for (let booking of bookings) {
    let update = {};
    if (typeof booking.customer_id === 'string') {
      update.customer_id = new ObjectId(booking.customer_id);
    }
    if (typeof booking.event_id === 'string') {
      update.event_id = new ObjectId(booking.event_id);
    }
    
    if (Object.keys(update).length > 0) {
      await db.collection('bookings').updateOne({ _id: booking._id }, { $set: update });
    }
  }
  
  const bookingSeats = await db.collection('booking_seats').find({}).toArray();
  for (let bs of bookingSeats) {
    let update = {};
    if (typeof bs.booking_id === 'string') {
      update.booking_id = new ObjectId(bs.booking_id);
    }
    if (typeof bs.show_seat_id === 'string') {
      update.show_seat_id = new ObjectId(bs.show_seat_id);
    }
    
    if (Object.keys(update).length > 0) {
      await db.collection('booking_seats').updateOne({ _id: bs._id }, { $set: update });
    }
  }

  console.log('Fixed Bookings!');
  await client.close();
}

fixBookings().catch(console.error);
