import { Booking } from '@/app/context/AppContext';

export type HallStatus = 'available' | 'limited' | 'booked';

export interface HallAvailabilityInfo {
  status: HallStatus;
  label: string;
  emoji: string;
  color: string;
}

/**
 * Calculate hall availability status based on bookings for the next 7 days
 * Returns: 'available', 'limited', or 'booked'
 */
export function calculateHallAvailability(
  hallId: string, 
  bookings: Booking[]
): HallAvailabilityInfo {
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  
  // Get all confirmed bookings for this hall in the next 7 days
  const upcomingBookings = bookings.filter(booking => {
    if (booking.hallId !== hallId || booking.status !== 'confirmed') {
      return false;
    }
    
    const bookingDate = new Date(booking.selectedDate);
    return bookingDate >= today && bookingDate <= next7Days;
  });
  
  // Calculate total possible slots in 7 days (5 time slots per day * 7 days = 35)
  const totalPossibleSlots = 35;
  const bookedSlots = upcomingBookings.length;
  const occupancyRate = bookedSlots / totalPossibleSlots;
  
  if (occupancyRate >= 0.8) {
    return {
      status: 'booked',
      label: 'Fully Booked',
      emoji: '🔴',
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
  } else if (occupancyRate >= 0.4) {
    return {
      status: 'limited',
      label: 'Limited Slots',
      emoji: '🟡',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
  } else {
    return {
      status: 'available',
      label: 'Available',
      emoji: '🟢',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
  }
}
