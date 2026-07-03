import express, { Request, Response, NextFunction } from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import venueRoutes from './routes/venueRoutes';
import eventRoutes from './routes/eventRoutes';
import seatRoutes from './routes/seatRoutes';
import bookingRoutes from './routes/bookingRoutes';
import waitlistRoutes from './routes/waitlistRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import supportRoutes from './routes/supportRoutes';
import { errorResponse } from './utils/response';
import { startJobs } from './jobs/scheduler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Running Node on 3000

app.use(cors());
app.use(express.json());

// Start background jobs
startJobs();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlists', waitlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/support', supportRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  errorResponse(res, 500, 'Internal Server Error', err.message);
});

import { createServer } from 'http';
import { initSocket } from './socket';

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
