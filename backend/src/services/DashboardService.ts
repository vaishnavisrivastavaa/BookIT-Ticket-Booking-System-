import prisma from '../utils/prisma';

export class DashboardService {
  static async getStats(user: any) {
    const isOrganiser = user.role === 'ORGANISER';
    const eventFilter = isOrganiser ? { organiser_id: user.id } : {};
    
    // For bookings, we need to find bookings for events owned by this organiser
    let bookingFilter = { status: 'CONFIRMED' };
    if (isOrganiser) {
      bookingFilter = {
        ...bookingFilter,
        events: { organiser_id: user.id }
      } as any;
    }

    const totalEvents = await prisma.events.count({ where: eventFilter });
    const totalVenues = await prisma.venues.count(); // Venues are global
    const totalUsers = await prisma.users.count();   // Users are global
    
    const totalBookings = await prisma.bookings.count({
      where: bookingFilter
    });

    const revenueResult = await prisma.bookings.aggregate({
      where: bookingFilter,
      _sum: { total_amount: true }
    });

    let waitlistFilter = { status: 'WAITING' };
    if (isOrganiser) {
      waitlistFilter = {
        ...waitlistFilter,
        events: { organiser_id: user.id }
      } as any;
    }
    const totalWaitlisted = await prisma.waitlist.count({
      where: waitlistFilter
    });

    const recentBookings = await prisma.bookings.findMany({
      where: bookingFilter,
      take: 5,
      orderBy: { booking_time: 'desc' },
      include: {
        users: true,
        events: true,
      }
    });

    return {
      totalEvents,
      totalVenues,
      totalUsers,
      totalBookings,
      totalWaitlisted,
      totalRevenue: revenueResult._sum.total_amount || 0,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        user: `${b.users.first_name} ${b.users.last_name}`,
        event: b.events.title,
        amount: b.total_amount,
        date: b.booking_time
      }))
    };
  }
}
