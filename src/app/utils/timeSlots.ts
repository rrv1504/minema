// Utility functions for calculating dynamic time slots based on movie duration

export interface DynamicTimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
}

/**
 * Generate available time slots for a movie on a given date
 * @param movieDurationMinutes - Duration of the movie in minutes
 * @param date - The selected date
 * @returns Array of available time slots with start and end times
 */
export function generateTimeSlots(movieDurationMinutes: number, date: Date): DynamicTimeSlot[] {
  const INTERVAL_MINUTES = 20; // 20 minutes for interval
  const CLEANING_MINUTES = 10; // 10 minutes for cleaning
  const BUFFER_MINUTES = INTERVAL_MINUTES + CLEANING_MINUTES; // Total 30 minutes
  
  const totalDuration = movieDurationMinutes + BUFFER_MINUTES;
  
  // Define cinema operating hours (10 AM to 11:30 PM)
  const startHour = 10;
  const endHour = 23;
  const endMinute = 30;
  
  const slots: DynamicTimeSlot[] = [];
  
  // Check if the selected date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isToday = selectedDate.getTime() === today.getTime();
  
  // If today, start from the next available hour
  let currentHour = startHour;
  let currentMinute = 0;
  
  if (isToday) {
    const now = new Date();
    currentHour = now.getHours() + 1; // Start from next hour
    currentMinute = 0;
    
    // If it's already past cinema closing time, return empty array
    if (currentHour >= endHour) {
      return [];
    }
  }
  
  // Generate slots throughout the day
  while (true) {
    const slotStartTime = currentHour * 60 + currentMinute;
    const slotEndTime = slotStartTime + totalDuration;
    const slotEndHour = Math.floor(slotEndTime / 60);
    const slotEndMinute = slotEndTime % 60;
    
    // Check if the slot would end before cinema closing time
    const closingTime = endHour * 60 + endMinute;
    if (slotEndTime > closingTime) {
      break;
    }
    
    // Create the slot
    const startTimeStr = formatTime(currentHour, currentMinute);
    const endTimeStr = formatTime(slotEndHour, slotEndMinute);
    
    slots.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      displayTime: startTimeStr,
    });
    
    // Move to next potential slot (after current movie ends with buffer)
    currentMinute += totalDuration;
    while (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
    }
    
    // Safety check to prevent infinite loop
    if (currentHour > endHour) {
      break;
    }
  }
  
  return slots;
}

/**
 * Format time in 12-hour format with AM/PM
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Check if a time slot overlaps with any existing bookings
 */
export function isTimeSlotAvailable(
  startTime: string,
  movieDurationMinutes: number,
  hallId: string,
  selectedDate: Date,
  bookings: any[]
): boolean {
  const BUFFER_MINUTES = 30;
  const totalDuration = movieDurationMinutes + BUFFER_MINUTES;
  
  // Convert start time to minutes
  const slotStartMinutes = timeToMinutes(startTime);
  const slotEndMinutes = slotStartMinutes + totalDuration;
  
  // Format the date to compare (YYYY-MM-DD format)
  const checkDateStr = selectedDate.toISOString().split('T')[0];
  
  // Check for conflicts with existing bookings
  for (const booking of bookings) {
    if (booking.hallId !== hallId || booking.status !== 'confirmed') {
      continue;
    }
    
    // Extract date from booking's selectedDate
    const bookingDateStr = new Date(booking.selectedDate).toISOString().split('T')[0];
    
    if (bookingDateStr !== checkDateStr) {
      continue;
    }
    
    // Get the booked slot's time range
    const bookedStartMinutes = timeToMinutes(booking.timeSlot);
    
    // Calculate the booked slot's end time
    // Assuming booking stores movieDurationMinutes (if not, we use a conservative 180 minutes = 3 hours)
    const bookedMovieDuration = booking.movieDurationMinutes || 180;
    const bookedEndMinutes = bookedStartMinutes + bookedMovieDuration + BUFFER_MINUTES;
    
    // Check for overlap using proper interval comparison
    // Two time slots overlap if:
    // - The new slot starts before the booked slot ends AND
    // - The new slot ends after the booked slot starts
    const hasOverlap = (slotStartMinutes < bookedEndMinutes) && (slotEndMinutes > bookedStartMinutes);
    
    if (hasOverlap) {
      return false; // Conflict detected
    }
  }
  
  return true;
}

/**
 * Convert time string (e.g., "10:00 AM") to minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour * 60 + minute;
}