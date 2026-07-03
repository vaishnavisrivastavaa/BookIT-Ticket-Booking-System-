import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import ManageEvents from '../pages/ManageEvents';
import ProtectedRoute from '../components/ProtectedRoute';

import CreateEvent from '../pages/CreateEvent';
import CreateVenue from '../pages/CreateVenue';
import SeatSelection from '../pages/SeatSelection';
import Checkout from '../pages/Checkout';
import BookingSuccess from '../pages/BookingSuccess';
import BookingHistory from '../pages/BookingHistory';
import BookingDetails from '../pages/BookingDetails';
import Venues from '../pages/Venues';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/booking-success/:bookingReference" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/manage-events" element={<ProtectedRoute roles={['ORGANISER', 'ADMIN']}><ManageEvents /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute roles={['ORGANISER', 'ADMIN']}><CreateEvent /></ProtectedRoute>} />
        <Route path="/create-venue" element={<ProtectedRoute roles={['ADMIN']}><CreateVenue /></ProtectedRoute>} />
        <Route path="/venues" element={<ProtectedRoute roles={['ADMIN']}><Venues /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
