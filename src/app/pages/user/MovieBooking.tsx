import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Clock, Users, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { format } from 'date-fns';

export default function MovieBooking() {
  const { movieId } = useParams();
  const { movies, halls, timeSlots, currentUser, isHallAvailable } = useApp();
  const navigate = useNavigate();
  
  const [groupSize, setGroupSize] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedHall, setSelectedHall] = useState<string>('');

  const movie = movies.find(m => m.id === movieId);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Auto-select hall based on group size and availability
    if (groupSize && selectedDate && selectedTimeSlot) {
      const size = parseInt(groupSize);
      const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
      
      if (!timeSlot) return;
      
      // Find a suitable hall that is both big enough and available
      const suitableHall = halls
        .filter(h => 
          h.isActive && 
          h.capacity >= size &&
          isHallAvailable(h.id, selectedDate, timeSlot.time)
        )
        .sort((a, b) => a.capacity - b.capacity)[0];
      
      if (suitableHall) {
        setSelectedHall(suitableHall.id);
      } else {
        // No available hall found
        setSelectedHall('');
      }
    }
  }, [groupSize, selectedDate, selectedTimeSlot, halls, timeSlots, isHallAvailable]);

  // Filter time slots based on selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    // If selected date is today, filter out past time slots
    if (selected.getTime() === today.getTime()) {
      const currentHour = new Date().getHours();
      return timeSlots.filter(slot => {
        const slotHour = parseInt(slot.time.split(':')[0]);
        const isPM = slot.time.includes('PM');
        const hour24 = isPM && slotHour !== 12 ? slotHour + 12 : slotHour;
        return hour24 > currentHour && slot.available;
      });
    }
    
    // For future dates, show all available slots
    return timeSlots.filter(ts => ts.available);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const hall = halls.find(h => h.id === selectedHall);
  const hallPrice = hall ? hall.capacity * (movie?.pricePerPerson || 0) : 0;

  const handleProceed = () => {
    if (!groupSize || !selectedTimeSlot || !selectedHall || !movie || !selectedDate) return;
    
    const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
    
    // Store booking data in session storage for next steps
    sessionStorage.setItem('bookingData', JSON.stringify({
      movieId: movie.id,
      movieName: movie.title,
      movieImageUrl: movie.imageUrl,
      hallId: selectedHall,
      hallName: hall?.name || '',
      hallCapacity: hall?.capacity || 0,
      selectedDate: selectedDate.toISOString(),
      timeSlot: timeSlot?.time || '',
      groupSize: parseInt(groupSize),
      hallPrice,
    }));
    
    navigate('/user/snacks');
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/home">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Book Hall</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Movie Details */}
          <div className="md:col-span-2">
            <Card className="cinema-poster glass-card border-purple-500/20 overflow-hidden">
              <div className="aspect-[2/3] overflow-hidden bg-black/50">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-white">{movie.title}</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold">{movie.rating}</Badge>
                </div>
                <CardDescription className="text-gray-400">{movie.genre}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">₹{movie.pricePerPerson} per person</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-3">
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Booking Details</CardTitle>
                <CardDescription className="text-gray-400">Enter your group information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Group Size */}
                <div className="space-y-2">
                  <Label htmlFor="groupSize" className="text-gray-300">
                    <Users className="h-4 w-4 inline mr-2" />
                    Group Size
                  </Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min="1"
                    placeholder="Enter number of people"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Select Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal glass-card-light border-purple-500/30 text-white hover:bg-purple-500/10 hover:border-purple-500/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-card border-purple-500/30" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const oneWeekFromNow = new Date(today);
                          oneWeekFromNow.setDate(today.getDate() + 7);
                          return date < today || date >= oneWeekFromNow;
                        }}
                        initialFocus
                        className="rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Slot */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Select Time Slot
                  </Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger className="glass-card-light border-purple-500/30 text-white focus:border-purple-500/50">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-purple-500/30">
                      {availableTimeSlots.map(slot => (
                        <SelectItem key={slot.id} value={slot.id} className="text-white focus:bg-purple-500/20">
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hall Selection (Auto-selected) */}
                {groupSize && selectedDate && selectedTimeSlot && !hall && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      <Film className="h-4 w-4 inline mr-2" />
                      Hall Availability
                    </Label>
                    <Card className="glass-card-light border-red-500/30 glow-red">
                      <CardContent className="pt-6">
                        <p className="text-sm text-red-400 mb-1">❌ No halls available</p>
                        <p className="text-xs text-gray-400">
                          All halls matching your group size are booked for this date and time. Please try a different time slot or date.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {hall && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      <Film className="h-4 w-4 inline mr-2" />
                      Selected Hall
                    </Label>
                    <Card className="glass-card-light border-purple-500/30 glow-purple">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{hall.name}</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 border-0">Capacity: {hall.capacity}</Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Automatically selected based on your group size
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Price Summary */}
                {groupSize && hall && (
                  <div className="border-t border-purple-500/20 pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Your Group Size:</span>
                        <span className="font-medium text-gray-200">{groupSize} people</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Hall Capacity:</span>
                        <span className="font-medium text-gray-200">{hall.capacity} seats</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price per Person:</span>
                        <span className="font-medium text-gray-200">₹{movie.pricePerPerson}</span>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-yellow-400 mb-1">⚠️ Full Hall Booking</p>
                        <p className="text-xs text-gray-400">You pay for the entire hall capacity ({hall.capacity} seats)</p>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t border-purple-500/20 pt-3">
                        <span className="text-white">Total Hall Price:</span>
                        <span className="text-red-500 glow-red">₹{hallPrice}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full gradient-button glow-red border-0"
                  size="lg"
                  onClick={handleProceed}
                  disabled={!groupSize || !selectedTimeSlot || !selectedHall}
                >
                  Proceed to Snacks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}