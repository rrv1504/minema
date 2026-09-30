import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Zap, DollarSign, Calendar, Star } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import type { Movie, Hall } from '@/app/context/AppContext';
import {
  generateTimeSlots,
  calculateDynamicPrice,
  calculateTotalDuration,
  calculateEndTime,
  suggestOptimalTimeSlots,
  getHallUtilization,
} from '@/app/utils/timeManagement';

interface IntelligentTimeSlotPickerProps {
  movie: Movie;
  hall: Hall;
  selectedDate: Date;
  onSelectTimeSlot: (timeSlot: string, dynamicPrice: number) => void;
}

export function IntelligentTimeSlotPicker({
  movie,
  hall,
  selectedDate,
  onSelectTimeSlot,
}: IntelligentTimeSlotPickerProps) {
  const { bookings } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; available: boolean; isPeak: boolean; recommendationScore: number }>
  >([]);

  useEffect(() => {
    // Generate intelligent time slots based on movie duration and hall capacity
    const slots = generateTimeSlots(
      movie.durationMinutes,
      hall.capacity,
      selectedDate,
      bookings,
      hall.id
    );
    setTimeSlots(slots);
  }, [movie.durationMinutes, hall.capacity, hall.id, selectedDate, bookings]);

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    const dynamicPrice = calculateDynamicPrice(movie.pricePerPerson * hall.capacity, time);
    onSelectTimeSlot(time, dynamicPrice);
  };

  // Get optimal slot suggestions
  const optimalSlots = suggestOptimalTimeSlots(timeSlots, 3);

  // Get hall utilization stats
  const utilizationStats = getHallUtilization(hall.id, selectedDate, bookings);

  return (
    <div className="space-y-6">
      {/* Utilization Overview */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Hall Utilization</h3>
            <p className="text-sm text-gray-400">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Occupancy Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {utilizationStats.utilizationPercentage}%
              </span>
              <span className="text-sm text-gray-500">
                ({utilizationStats.bookedSlots}/{utilizationStats.totalSlots} slots)
              </span>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Peak Bookings</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {utilizationStats.peakSlotsBooked}
              </span>
              <span className="text-sm text-gray-500">
                / {utilizationStats.offPeakSlotsBooked} off-peak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Slots */}
      {optimalSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Recommended Slots</h3>
          </div>
          <div className="grid gap-3">
            {optimalSlots.map((slot) => {
              const basePrice = movie.pricePerPerson * hall.capacity;
              const dynamicPrice = calculateDynamicPrice(basePrice, slot.time);
              const discount = basePrice - dynamicPrice;
              const totalDuration = calculateTotalDuration(
                movie.durationMinutes,
                hall.capacity,
                slot.time
              );
              const endTime = calculateEndTime(slot.time, totalDuration);

              return (
                <button
                  key={slot.time}
                  onClick={() => handleSlotSelect(slot.time)}
                  className={`
                    relative overflow-hidden rounded-xl p-4 text-left transition-all
                    ${
                      selectedSlot === slot.time
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30'
                    }
                    border ${
                      selectedSlot === slot.time ? 'border-purple-400' : 'border-purple-500/30'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">{slot.time}</p>
                        <p className="text-sm text-gray-300">Ends at {endTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">₹{dynamicPrice.toLocaleString()}</p>
                      {discount > 0 && (
                        <p className="text-sm text-green-400">Save ₹{Math.abs(discount)}</p>
                      )}
                      {discount < 0 && (
                        <p className="text-sm text-amber-400">+₹{Math.abs(discount)} peak</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {slot.isPeak && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          Peak Time
                        </span>
                      )}
                      <span className="text-sm text-gray-400">{slot.reason}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-3 rounded-full ${
                            i < Math.floor(slot.recommendationScore / 20)
                              ? 'bg-green-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All Available Slots */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">All Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeSlots.map((slot) => {
            if (!slot.available) return null;

            const basePrice = movie.pricePerPerson * hall.capacity;
            const dynamicPrice = calculateDynamicPrice(basePrice, slot.time);
            const discount = basePrice - dynamicPrice;
            const totalDuration = calculateTotalDuration(
              movie.durationMinutes,
              hall.capacity,
              slot.time
            );
            const endTime = calculateEndTime(slot.time, totalDuration);

            return (
              <button
                key={slot.time}
                onClick={() => handleSlotSelect(slot.time)}
                className={`
                  relative rounded-xl p-4 text-left transition-all
                  ${
                    selectedSlot === slot.time
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20'
                      : 'bg-black/30 hover:bg-black/40'
                  }
                  border ${
                    selectedSlot === slot.time
                      ? 'border-purple-400'
                      : 'border-white/10 hover:border-purple-500/30'
                  }
                `}
              >
                <div className="mb-2">
                  <p className="text-lg font-bold text-white">{slot.time}</p>
                  <p className="text-xs text-gray-400">to {endTime}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      ₹{dynamicPrice.toLocaleString()}
                    </p>
                    {discount !== 0 && (
                      <p className={`text-xs ${discount > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                        {discount > 0 ? `-${Math.abs(discount)}` : `+${Math.abs(discount)}`}
                      </p>
                    )}
                  </div>
                  {slot.isPeak && (
                    <Zap className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {timeSlots.filter((slot) => slot.available).length === 0 && (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No available slots for this date</p>
            <p className="text-sm text-gray-500 mt-1">Please select a different date</p>
          </div>
        )}
      </div>

      {/* Price Legend */}
      <div className="bg-black/30 rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-3">Pricing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-green-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Morning Shows</p>
              <p className="text-gray-400 text-xs">15% discount (before 12 PM)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Peak Hours</p>
              <p className="text-gray-400 text-xs">20% premium (6-11 PM, 1-4 PM)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Smart Buffer</p>
              <p className="text-gray-400 text-xs">Dynamic cleanup time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}