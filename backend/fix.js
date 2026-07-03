const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.DATABASE_URL;
async function fix() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const events = await db.collection('events').find({}).toArray();
  for (let event of events) {
    if (typeof event.venue_id === 'string') {
      await db.collection('events').updateOne({ _id: event._id }, { $set: { venue_id: new ObjectId(event.venue_id), organiser_id: new ObjectId(event.organiser_id) } });
    }
  }
  const showSeats = await db.collection('show_seats').find({}).toArray();
  for (let seat of showSeats) {
    if (typeof seat.event_id === 'string') {
      await db.collection('show_seats').updateOne({ _id: seat._id }, { $set: { event_id: new ObjectId(seat.event_id), venue_seat_id: new ObjectId(seat.venue_seat_id) } });
    }
  }
  const eventPrices = await db.collection('event_prices').find({}).toArray();
  for (let price of eventPrices) {
    if (typeof price.event_id === 'string') {
      await db.collection('event_prices').updateOne({ _id: price._id }, { $set: { event_id: new ObjectId(price.event_id) } });
    }
  }
  console.log('Fixed IDs!');
  await client.close();
}
fix().catch(console.error);
