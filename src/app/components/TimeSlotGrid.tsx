import { Check, Lock, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isSelected: boolean;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onSelectSlot: (startTime: string) => void;
  movieDuration?: string;
}

export function TimeSlotGrid({ slots, onSelectSlot, movieDuration }: TimeSlotGridProps) {
  const availableCount = slots.filter(s => s.isAvailable).length;
  const bookedCount = slots.filter(s => !s.isAvailable).length;

  return (
    <div className="space-y-4">
      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 p-4 glass-card-light border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 glow-green"></div>
          <span className="text-xs text-gray-300">Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 glow-red"></div>
          <span className="text-xs text-gray-300">Booked ({bookedCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-red-500"></div>
          <span className="text-xs text-gray-300">Selected</span>
        </div>
      </div>

      {/* Time Slots Grid */}
      {slots.length === 0 ? (
        <div className="text-center py-12 glass-card-light border border-purple-500/20 rounded-lg">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400 mb-1">No time slots available</p>
          <p className="text-sm text-gray-500">Please try a different date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((slot, index) => (
            <Button
              key={index}
              variant="outline"
              className={`
                relative h-auto p-4 overflow-hidden transition-all duration-300
                ${slot.isSelected
                  ? 'gradient-button glow-red border-0 scale-105 shadow-lg shadow-red-500/30'
                  : slot.isAvailable
                  ? 'glass-card-light border-green-500/40 hover:border-green-500/60 hover:bg-green-500/5 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105'
                  : 'glass-card-light border-red-500/30 bg-red-900/10 cursor-not-allowed opacity-60'
                }
              `}
              onClick={() => slot.isAvailable && onSelectSlot(slot.startTime)}
              disabled={!slot.isAvailable}
            >
              {/* Status Indicator Badge */}
              <div className="absolute top-2 right-2">
                {slot.isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : slot.isAvailable ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-red-400" />
                  </div>
                )}
              </div>

              {/* Time Display */}
              <div className="flex flex-col items-start w-full pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-4 w-4 ${
                    slot.isSelected 
                      ? 'text-white' 
                      : slot.isAvailable 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    slot.isSelected 
                      ? 'text-white' 
                      : slot.isAvailable 
                      ? 'text-gray-200' 
                      : 'text-gray-500'
                  }`}>
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
                
                <div className="text-left">
                  <p className={`text-xl font-bold ${
                    slot.isSelected 
                      ? 'text-white' 
                      : slot.isAvailable 
                      ? 'text-white' 
                      : 'text-gray-500'
                  }`}>
                    {slot.startTime}
                  </p>
                  <p className={`text-xs ${
                    slot.isSelected 
                      ? 'text-white/80' 
                      : slot.isAvailable 
                      ? 'text-gray-400' 
                      : 'text-gray-600'
                  }`}>
                    Ends at {slot.endTime}
                  </p>
                </div>
              </div>

              {/* Glow Effect for Available Slots */}
              {slot.isAvailable && !slot.isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Duration Info */}
      {movieDuration && slots.length > 0 && (
        <div className="text-center p-3 glass-card-light border border-purple-500/20 rounded-lg">
          <p className="text-xs text-gray-400">
            <span className="text-purple-400 font-medium">{movieDuration}</span> movie duration + 30 min buffer (20 min interval + 10 min cleaning)
          </p>
        </div>
      )}
    </div>
  );
}
