import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Clock, Users, IndianRupee, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { format } from 'date-fns';
import { generateTimeSlots, isTimeSlotAvailable } from '@/app/utils/timeSlots';
import { calculateHallAvailability } from '@/app/utils/hallAvailability';
import { TimeSlotGrid } from '@/app/components/TimeSlotGrid';

export default function HallFirstFlow() {
  const { hallId } = useParams();
  const { movies, halls, currentUser, bookings } = useApp();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [isMovieListExpanded, setIsMovieListExpanded] = useState<boolean>(true);

  const hall = halls.find(h => h.id === hallId);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Hall not found</p>
      </div>
    );
  }

  const selectedMovieData = movies.find(m => m.id === selectedMovie);
  
  // Generate dynamic time slots based on selected movie duration
  const allTimeSlots = selectedMovieData && selectedDate 
    ? generateTimeSlots(selectedMovieData.durationMinutes, selectedDate)
    : [];

  // Check availability for each time slot
  const getTimeSlotAvailability = (slot: string) => {
    if (!selectedDate || !selectedMovieData) return false;
    return isTimeSlotAvailable(slot, selectedMovieData.durationMinutes, hall.id, selectedDate, bookings);
  };

  const hallPrice = selectedMovieData ? hall.capacity * selectedMovieData.pricePerPerson : 0;
  const availability = calculateHallAvailability(hall.id, bookings);

  const handleProceed = () => {
    if (!selectedTimeSlot || !selectedMovie || !selectedDate || !selectedMovieData) return;
    
    // Store booking data in session storage for next steps
    sessionStorage.setItem('bookingData', JSON.stringify({
      movieId: selectedMovieData.id,
      movieName: selectedMovieData.title,
      movieImageUrl: selectedMovieData.imageUrl,
      movieDurationMinutes: selectedMovieData.durationMinutes, // Added for accurate time slot checking
      hallId: hall.id,
      hallName: hall.name,
      hallCapacity: hall.capacity,
      selectedDate: selectedDate.toISOString(),
      timeSlot: selectedTimeSlot,
      groupSize: hall.capacity, // Full hall capacity
      hallPrice,
    }));
    
    navigate('/user/snacks');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/select-hall">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Book Movie for {hall.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hall Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-purple-500/20 overflow-hidden sticky top-8">
              <div className="aspect-video overflow-hidden bg-black/50">
                <img
                  src={hall.imageUrl}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl">{hall.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  Capacity: {hall.capacity} people
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={`${availability.color} border w-fit`}>
                  {availability.emoji} {availability.label}
                </Badge>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400">
                    You will pay for the entire hall capacity regardless of your group size
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Selection */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="cursor-pointer" onClick={() => selectedMovie && setIsMovieListExpanded(!isMovieListExpanded)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Select Movie</CardTitle>
                    <CardDescription className="text-gray-400">
                      {selectedMovie 
                        ? `Selected: ${selectedMovieData?.title}` 
                        : 'Choose which movie you\'d like to watch'}
                    </CardDescription>
                  </div>
                  {selectedMovie && (
                    <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
                      {isMovieListExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedMovie || isMovieListExpanded ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {movies.map(movie => (
                      <Card 
                        key={movie.id}
                        className={`cinema-poster glass-card overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                          selectedMovie === movie.id 
                            ? 'border-red-500 border-2 glow-red shadow-lg shadow-red-500/50' 
                            : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        onClick={() => {
                          setSelectedMovie(movie.id);
                          setSelectedTimeSlot(''); // Reset time slot when movie changes
                          setIsMovieListExpanded(false); // Minimize after selection
                        }}
                      >
                        <div className="aspect-[2/3] overflow-hidden bg-black/50 relative">
                          <img
                            src={movie.imageUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                          {selectedMovie === movie.id && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-red-500 border-red-600 text-white text-xs animate-pulse">
                                ✓ Selected
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base text-white">{movie.title}</CardTitle>
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold text-xs">
                              {movie.rating}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            {movie.duration}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{movie.genre}</span>
                            <span className="font-semibold text-sm text-white">
                              ₹{movie.pricePerPerson}
                              <span className="text-xs font-normal text-gray-400">/person</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Minimized selected movie view */
                  <Card 
                    className="cinema-poster glass-card overflow-hidden border-red-500 border-2 glow-red shadow-lg shadow-red-500/50 cursor-pointer"
                    onClick={() => setIsMovieListExpanded(true)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-24 h-36 overflow-hidden bg-black/50 rounded-lg relative flex-shrink-0">
                        <img
                          src={selectedMovieData!.imageUrl}
                          alt={selectedMovieData!.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-red-500 border-red-600 text-white text-xs animate-pulse">
                            ✓
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white">{selectedMovieData!.title}</h3>
                          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold text-xs">
                            {selectedMovieData!.rating}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{selectedMovieData!.duration}</span>
                            <span className="mx-2">•</span>
                            <span>{selectedMovieData!.genre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              ₹{selectedMovieData!.pricePerPerson}
                              <span className="text-xs font-normal text-gray-400">/person</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-purple-400 mt-2">Click to change movie</p>
                      </div>
                    </div>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Date Selection */}
            {selectedMovie && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Select Date</CardTitle>
                  <CardDescription className="text-gray-400">Choose your preferred date</CardDescription>
                </CardHeader>
                <CardContent>
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
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTimeSlot(''); // Reset time slot when date changes
                        }}
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
                </CardContent>
              </Card>
            )}

            {/* Time Slot Selection */}
            {selectedMovie && selectedDate && selectedMovieData && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Select Time Slot</CardTitle>
                  <CardDescription className="text-gray-400">
                    Available time slots for {selectedMovieData.duration} (includes 30 min buffer)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSlotGrid
                    slots={allTimeSlots.map(slot => ({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      isAvailable: getTimeSlotAvailability(slot.startTime),
                      isSelected: selectedTimeSlot === slot.startTime,
                    }))}
                    onSelectSlot={setSelectedTimeSlot}
                    movieDuration={selectedMovieData.duration}
                  />
                </CardContent>
              </Card>
            )}

            {/* Price Summary */}
            {selectedMovieData && selectedTimeSlot && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hall:</span>
                    <span className="font-medium text-gray-200">{hall.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Movie:</span>
                    <span className="font-medium text-gray-200">{selectedMovieData.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-medium text-gray-200">
                      {selectedDate ? format(selectedDate, 'PPP') : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-medium text-gray-200">{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hall Capacity:</span>
                    <span className="font-medium text-gray-200">{hall.capacity} seats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price per Person:</span>
                    <span className="font-medium text-gray-200">₹{selectedMovieData.pricePerPerson}</span>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">⚠️ Full Hall Booking</p>
                    <p className="text-xs text-gray-400">
                      You pay for the entire hall capacity ({hall.capacity} seats)
                    </p>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-purple-500/20 pt-3">
                    <span className="text-white">Total Hall Price:</span>
                    <span className="text-red-500 glow-red">₹{hallPrice}</span>
                  </div>
                  <Button
                    className="w-full gradient-button glow-red border-0 mt-4"
                    size="lg"
                    onClick={handleProceed}
                    disabled={!selectedTimeSlot || !selectedMovie}
                  >
                    Proceed to Snacks
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}