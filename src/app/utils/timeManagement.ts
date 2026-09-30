import type { Booking } from '@/app/context/AppContext';

// Time slot configuration
export interface TimeSlotConfig {
  startTime: string; // 24-hour format "HH:MM"
  isPeakTime: boolean;
  peakMultiplier: number; // Price multiplier for peak times
}

// Intelligent buffer calculation based on hall size and time of day
export function calculateDynamicBuffer(hallCapacity: number, isPeakTime: boolean): number {
  // Base buffer: 20 minutes
  let buffer = 20;
  
  // Add 5 minutes for every 30 seats (larger halls need more cleanup time)
  buffer += Math.floor(hallCapacity / 30) * 5;
  
  // Add 10 minutes during peak times for better turnaround
  if (isPeakTime) {
    buffer += 10;
  }
  
  // Cap maximum buffer at 45 minutes
  return Math.min(buffer, 45);
}

// Determine if a time slot is during peak hours
export function isPeakTime(timeString: string): boolean {
  // Convert time string like "07:00 PM" to 24-hour format
  const time24 = convertTo24Hour(timeString);
  const hour = parseInt(time24.split(':')[0]);
  
  // Peak times: 6 PM - 11 PM (18:00 - 23:00) on weekdays and all day on weekends
  // Weekend check would need date, so for now focusing on time
  // Evening peak: 6 PM - 11 PM
  // Afternoon peak: 1 PM - 4 PM (matinee shows)
  return (hour >= 18 && hour < 23) || (hour >= 13 && hour < 16);
}

// Calculate dynamic pricing based on time slot
export function calculateDynamicPrice(basePrice: number, timeString: string): number {
  if (isPeakTime(timeString)) {
    // 20% premium for peak times
    return Math.round(basePrice * 1.2);
  }
  
  // Convert to 24-hour to check for off-peak discount
  const time24 = convertTo24Hour(timeString);
  const hour = parseInt(time24.split(':')[0]);
  
  // Morning shows (before 12 PM): 15% discount
  if (hour < 12) {
    return Math.round(basePrice * 0.85);
  }
  
  // Late night shows (after 10 PM): 10% discount
  if (hour >= 22) {
    return Math.round(basePrice * 0.9);
  }
  
  return basePrice;
}

// Generate intelligent time slots based on movie duration and hall constraints
export function generateTimeSlots(
  movieDurationMinutes: number,
  hallCapacity: number,
  date: Date,
  existingBookings: Booking[],
  hallId: string
): Array<{ time: string; available: boolean; isPeak: boolean; recommendationScore: number }> {
  const slots = [];
  
  // Operating hours: 9 AM to 11 PM
  const endHour = 23;
  
  // Start with morning slot
  let currentHour = 9;
  let currentMinutes = 0;
  
  // Safety counter to prevent infinite loops
  let iterationCount = 0;
  const maxIterations = 20;
  
  while (currentHour < endHour && iterationCount < maxIterations) {
    iterationCount++;
    
    const timeString = formatTime(currentHour, currentMinutes);
    const isPeak = isPeakTime(timeString);
    const buffer = calculateDynamicBuffer(hallCapacity, isPeak);
    const totalDuration = movieDurationMinutes + buffer;
    
    // Calculate end time for this showing
    let endMinutes = currentMinutes + totalDuration;
    let endHour = currentHour + Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;
    
    // Only add slot if movie ends before closing time (11 PM = 23:00)
    if (endHour < 23 || (endHour === 23 && endMinutes === 0)) {
      // Check availability
      const available = isTimeSlotAvailable(hallId, date, timeString, existingBookings);
      
      // Calculate recommendation score (0-100)
      const recommendationScore = calculateRecommendationScore(
        currentHour,
        currentMinutes,
        available,
        existingBookings,
        hallId,
        date
      );
      
      slots.push({
        time: timeString,
        available,
        isPeak,
        recommendationScore,
      });
    }
    
    // Move to next possible slot (3 hours apart for spacing)
    currentMinutes += 180; // 3 hours between showings
    while (currentMinutes >= 60) {
      currentHour += 1;
      currentMinutes -= 60;
    }
  }
  
  return slots;
}

// Check if a specific time slot is available
function isTimeSlotAvailable(
  hallId: string,
  date: Date,
  timeSlot: string,
  bookings: Booking[]
): boolean {
  const checkDateStr = date.toISOString().split('T')[0];
  
  return !bookings.some(booking => {
    if (booking.hallId !== hallId || booking.status !== 'confirmed') {
      return false;
    }
    const bookingDateStr = new Date(booking.selectedDate).toISOString().split('T')[0];
    return bookingDateStr === checkDateStr && booking.timeSlot === timeSlot;
  });
}

// Calculate recommendation score for a time slot
function calculateRecommendationScore(
  hour: number,
  minutes: number,
  available: boolean,
  bookings: Booking[],
  hallId: string,
  date: Date
): number {
  if (!available) return 0;
  
  let score = 50; // Base score
  
  // Prefer peak times (higher score for popular times)
  const timeString = formatTime(hour, minutes);
  if (isPeakTime(timeString)) {
    score += 20;
  }
  
  // Prefer afternoon/evening slots
  if (hour >= 13 && hour < 20) {
    score += 15;
  }
  
  // Slight preference for prime time (7 PM - 9 PM)
  if (hour >= 19 && hour < 21) {
    score += 10;
  }
  
  // Check hall utilization for the day
  const dateStr = date.toISOString().split('T')[0];
  const dayBookings = bookings.filter(b => {
    const bookingDateStr = new Date(b.selectedDate).toISOString().split('T')[0];
    return bookingDateStr === dateStr && b.hallId === hallId && b.status === 'confirmed';
  });
  
  // If hall is underutilized, boost score for all available slots
  if (dayBookings.length < 2) {
    score += 15;
  }
  
  // Weekend bonus (if applicable - would need day of week)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    score += 10;
  }
  
  return Math.min(100, score);
}

// Helper: Convert 12-hour time string to 24-hour format
export function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Helper: Format hour and minutes to 12-hour time string
function formatTime(hour: number, minutes: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate total duration including intelligent buffer
export function calculateTotalDuration(
  movieDurationMinutes: number,
  hallCapacity: number,
  timeString: string
): number {
  const isPeak = isPeakTime(timeString);
  const buffer = calculateDynamicBuffer(hallCapacity, isPeak);
  return movieDurationMinutes + buffer;
}

// Get time slot end time
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const time24 = convertTo24Hour(startTime);
  const [hours, minutes] = time24.split(':').map(Number);
  
  let endMinutes = minutes + durationMinutes;
  let endHours = hours + Math.floor(endMinutes / 60);
  endMinutes = endMinutes % 60;
  
  return formatTime(endHours, endMinutes);
}

// Suggest optimal time slots
export function suggestOptimalTimeSlots(
  availableSlots: Array<{ time: string; available: boolean; isPeak: boolean; recommendationScore: number }>,
  limit: number = 3
): Array<{ time: string; isPeak: boolean; recommendationScore: number; reason: string }> {
  // Filter only available slots and sort by recommendation score
  const sortedSlots = availableSlots
    .filter(slot => slot.available)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
  
  return sortedSlots.map(slot => {
    let reason = '';
    
    if (slot.recommendationScore >= 90) {
      reason = 'Highly recommended - Prime time slot';
    } else if (slot.recommendationScore >= 75) {
      reason = 'Great choice - Popular time';
    } else if (slot.isPeak) {
      reason = 'Peak hours - Higher demand';
    } else if (slot.recommendationScore >= 60) {
      reason = 'Good option - Off-peak discount';
    } else {
      reason = 'Available';
    }
    
    return {
      time: slot.time,
      isPeak: slot.isPeak,
      recommendationScore: slot.recommendationScore,
      reason,
    };
  });
}

// Check for conflicting bookings within time window
export function hasConflictingBookings(
  hallId: string,
  date: Date,
  startTime: string,
  durationMinutes: number,
  bookings: Booking[]
): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const start24 = convertTo24Hour(startTime);
  const [startHour, startMin] = start24.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  
  return bookings.some(booking => {
    if (booking.hallId !== hallId || booking.status !== 'confirmed') {
      return false;
    }
    
    const bookingDateStr = new Date(booking.selectedDate).toISOString().split('T')[0];
    if (bookingDateStr !== dateStr) return false;
    
    // Get booking time range
    const bookingStart24 = convertTo24Hour(booking.timeSlot);
    const [bookingStartHour, bookingStartMin] = bookingStart24.split(':').map(Number);
    const bookingStartMinutes = bookingStartHour * 60 + bookingStartMin;
    
    // Assume 3 hour window for each booking (average movie + buffer)
    const bookingEndMinutes = bookingStartMinutes + 180;
    
    // Check for overlap
    return (
      (startTotalMinutes >= bookingStartMinutes && startTotalMinutes < bookingEndMinutes) ||
      (endTotalMinutes > bookingStartMinutes && endTotalMinutes <= bookingEndMinutes) ||
      (startTotalMinutes <= bookingStartMinutes && endTotalMinutes >= bookingEndMinutes)
    );
  });
}

// Get utilization statistics for a hall on a specific date
export function getHallUtilization(
  hallId: string,
  date: Date,
  bookings: Booking[]
): {
  totalSlots: number;
  bookedSlots: number;
  utilizationPercentage: number;
  peakSlotsBooked: number;
  offPeakSlotsBooked: number;
} {
  const dateStr = date.toISOString().split('T')[0];
  const dayBookings = bookings.filter(b => {
    const bookingDateStr = new Date(b.selectedDate).toISOString().split('T')[0];
    return bookingDateStr === dateStr && b.hallId === hallId && b.status === 'confirmed';
  });
  
  // Assuming maximum 5 slots per day
  const totalSlots = 5;
  const bookedSlots = dayBookings.length;
  
  const peakSlotsBooked = dayBookings.filter(b => isPeakTime(b.timeSlot)).length;
  const offPeakSlotsBooked = bookedSlots - peakSlotsBooked;
  
  return {
    totalSlots,
    bookedSlots,
    utilizationPercentage: Math.round((bookedSlots / totalSlots) * 100),
    peakSlotsBooked,
    offPeakSlotsBooked,
  };
}