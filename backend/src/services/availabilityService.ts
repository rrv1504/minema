import { Booking } from "../models/Booking.js";
import { Hall } from "../models/Hall.js";
import { OperatingHours } from "../models/OperatingHours.js";
import { AppError } from "../utils/AppError.js";
import { generateTwoHourSlots, isDateWithinBookingWindow, parseTimeToMinutes } from "../utils/dateTime.js";

export async function assertBookingAvailability(hallId: string, selectedDate: string, timeSlot: string, groupSize: number): Promise<void> {
  if (!isDateWithinBookingWindow(selectedDate)) throw new AppError("Bookings must be made within the next 7 days");
  const [hall, operatingHours, existing] = await Promise.all([
    Hall.findById(hallId),
    OperatingHours.findOne({ date: selectedDate }),
    Booking.exists({ hallId, selectedDate, timeSlot, status: "confirmed" })
  ]);
  if (!hall || !hall.isActive) throw new AppError("Hall is unavailable", 404);
  if (groupSize > hall.capacity) throw new AppError("Group size exceeds hall capacity");
  if (!operatingHours) throw new AppError("No operating hours have been configured for this date");
  const slot = parseTimeToMinutes(timeSlot);
  const start = parseTimeToMinutes(operatingHours.startTime);
  const end = parseTimeToMinutes(operatingHours.endTime);
  if (slot === null || start === null || end === null || slot < start || slot >= end) {
    throw new AppError("Time slot falls outside operating hours");
  }
  if (existing) throw new AppError("This hall is already booked for the selected date and time", 409);
}

export async function getAvailability(hallId: string, date: string) {
  if (!isDateWithinBookingWindow(date)) throw new AppError("Date must be within the next 7 days");
  const [hall, operatingHours, bookings] = await Promise.all([
    Hall.findById(hallId),
    OperatingHours.findOne({ date }),
    Booking.find({ hallId, selectedDate: date, status: "confirmed" }).select("timeSlot -_id")
  ]);
  if (!hall || !hall.isActive) throw new AppError("Hall is unavailable", 404);
  if (!operatingHours) return { hallId, date, timeSlots: [], operatingHours: null };
  const bookedSlots = new Set(bookings.map((booking) => booking.timeSlot));
  return {
    hallId,
    date,
    operatingHours,
    timeSlots: generateTwoHourSlots(operatingHours.startTime, operatingHours.endTime).map((time) => ({ time, available: !bookedSlots.has(time) }))
  };
}
