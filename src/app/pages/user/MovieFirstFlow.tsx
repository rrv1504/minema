import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Clock, Users, IndianRupee, Calendar as CalendarIcon, Lock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { format } from 'date-fns';
import { generateTimeSlots, isTimeSlotAvailable } from '@/app/utils/timeSlots';
import { calculateHallAvailability } from '@/app/utils/hallAvailability';
import { TimeSlotGrid } from '@/app/components/TimeSlotGrid';
import Slider from 'react-slick';

export default function MovieFirstFlow() {
  const { movieId } = useParams();
  const { movies, halls, currentUser, bookings } = useApp();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [isHallListExpanded, setIsHallListExpanded] = useState<boolean>(true);

  const movie = movies.find(m => m.id === movieId);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  // Generate dynamic time slots based on movie duration
  const availableTimeSlots = selectedDate ? generateTimeSlots(movie.durationMinutes, selectedDate) : [];

  // Check availability for each time slot across all active halls
  const getTimeSlotAvailability = (slot: string) => {
    if (!selectedDate) return false;
    
    // Check if at least one active hall is available for this time slot
    return halls.some(h => 
      h.isActive && isTimeSlotAvailable(slot, movie.durationMinutes, h.id, selectedDate, bookings)
    );
  };

  // Filter halls that are available for the selected date and time
  const getAllHallsWithAvailability = () => {
    if (!selectedDate || !selectedTimeSlot) {
      return halls.map(h => ({
        ...h,
        isBookable: h.isActive,
        availabilityReason: h.isActive ? 'Available' : 'Hall Inactive'
      }));
    }
    
    return halls.map(h => {
      if (!h.isActive) {
        return {
          ...h,
          isBookable: false,
          availabilityReason: 'Hall Inactive'
        };
      }
      
      const isAvailable = isTimeSlotAvailable(selectedTimeSlot, movie.durationMinutes, h.id, selectedDate, bookings);
      return {
        ...h,
        isBookable: isAvailable,
        availabilityReason: isAvailable ? 'Available' : 'Booked for this time'
      };
    });
  };

  const hallsWithAvailability = getAllHallsWithAvailability();
  const selectedHallData = halls.find(h => h.id === selectedHall);
  const hallPrice = selectedHallData ? selectedHallData.capacity * movie.pricePerPerson : 0;

  const handleProceed = () => {
    if (!selectedTimeSlot || !selectedHall || !selectedDate) return;
    
    // Store booking data in session storage for next steps
    sessionStorage.setItem('bookingData', JSON.stringify({
      movieId: movie.id,
      movieName: movie.title,
      movieImageUrl: movie.imageUrl,
      movieDurationMinutes: movie.durationMinutes, // Added for accurate time slot checking
      hallId: selectedHall,
      hallName: selectedHallData?.name || '',
      hallCapacity: selectedHallData?.capacity || 0,
      selectedDate: selectedDate.toISOString(),
      timeSlot: selectedTimeSlot,
      groupSize: selectedHallData?.capacity || 0, // Full hall capacity
      hallPrice,
    }));
    
    navigate('/user/snacks');
  };

  const hallsCarouselSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/select-movie">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Book Hall for {movie.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="cinema-poster glass-card border-purple-500/20 overflow-hidden sticky top-8">
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
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold">
                    {movie.rating}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">{movie.genre}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">₹{movie.pricePerPerson} per person</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
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
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {selectedDate && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Select Time Slot</CardTitle>
                  <CardDescription className="text-gray-400">
                    Available time slots for {movie.duration} (includes 30 min buffer)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSlotGrid
                    slots={availableTimeSlots.map(slot => ({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      isAvailable: getTimeSlotAvailability(slot.startTime),
                      isSelected: selectedTimeSlot === slot.startTime,
                    }))}
                    onSelectSlot={setSelectedTimeSlot}
                    movieDuration={movie.duration}
                  />
                </CardContent>
              </Card>
            )}

            {/* Hall Selection */}
            {selectedDate && selectedTimeSlot && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader className="cursor-pointer" onClick={() => selectedHall && setIsHallListExpanded(!isHallListExpanded)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Select Hall</CardTitle>
                      <CardDescription className="text-gray-400">
                        {selectedHall 
                          ? `Selected: ${selectedHallData?.name}` 
                          : `Showing all halls - ${hallsWithAvailability.filter(h => h.isBookable).length} available`}
                      </CardDescription>
                    </div>
                    {selectedHall && (
                      <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
                        {isHallListExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedHall || isHallListExpanded ? (
                    <div className="halls-carousel">
                      <Slider {...hallsCarouselSettings}>
                        {hallsWithAvailability.map(hall => {
                          const availability = calculateHallAvailability(hall.id, bookings);
                          const isBookable = hall.isBookable;
                          
                          return (
                          <div key={hall.id} className="px-3">
                            <Card 
                              className={`glass-card overflow-hidden transition-all transform hover:scale-105 relative ${
                                isBookable 
                                  ? selectedHall === hall.id 
                                    ? 'border-red-500 border-2 glow-red shadow-lg shadow-red-500/50 cursor-pointer' 
                                    : 'border-purple-500/20 hover:border-purple-500/40 cursor-pointer'
                                  : 'border-gray-500/20 opacity-60 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (isBookable) {
                                  setSelectedHall(hall.id);
                                  setIsHallListExpanded(false); // Minimize after selection
                                }
                              }}
                            >
                              <div className="aspect-video overflow-hidden bg-black/50 relative">
                                <img
                                  src={hall.imageUrl}
                                  alt={hall.name}
                                  className={`w-full h-full object-cover ${!isBookable ? 'grayscale' : ''}`}
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                  {isBookable ? (
                                    selectedHall === hall.id ? (
                                      <Badge className="bg-red-500 border-red-600 text-white text-xs animate-pulse backdrop-blur-sm">
                                        ✓ Selected
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-500/20 border-green-500 text-green-400 text-xs backdrop-blur-sm">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Available
                                      </Badge>
                                    )
                                  ) : (
                                    <Badge className="bg-red-500/20 border-red-500 text-red-400 text-xs backdrop-blur-sm">
                                      <Lock className="w-3 h-3 mr-1" />
                                      {hall.availabilityReason}
                                    </Badge>
                                  )}
                                </div>
                                {!isBookable && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                      <p className="text-sm font-semibold text-red-400">{hall.availabilityReason}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <CardHeader>
                                <CardTitle className={`text-lg ${isBookable ? 'text-white' : 'text-gray-500'}`}>
                                  {hall.name}
                                </CardTitle>
                                <CardDescription className={`flex items-center gap-2 ${isBookable ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Users className="h-4 w-4" />
                                  Capacity: {hall.capacity} people
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className={isBookable ? 'text-gray-400' : 'text-gray-600'}>
                                      Price per person:
                                    </span>
                                    <span className={isBookable ? 'text-gray-200' : 'text-gray-600'}>
                                      ₹{movie.pricePerPerson}
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t border-purple-500/20 pt-2">
                                    <span className={isBookable ? 'text-gray-300' : 'text-gray-600'}>
                                      Total Hall Price:
                                    </span>
                                    <span className={isBookable ? 'text-red-500' : 'text-gray-600'}>
                                      ₹{hall.capacity * movie.pricePerPerson}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          );
                        })}
                      </Slider>
                    </div>
                  ) : (
                    /* Minimized selected hall view */
                    <Card 
                      className="glass-card overflow-hidden border-red-500 border-2 glow-red shadow-lg shadow-red-500/50 cursor-pointer"
                      onClick={() => setIsHallListExpanded(true)}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-32 h-20 overflow-hidden bg-black/50 rounded-lg relative flex-shrink-0">
                          <img
                            src={selectedHallData!.imageUrl}
                            alt={selectedHallData!.name}
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
                            <h3 className="text-lg font-bold text-white">{selectedHallData!.name}</h3>
                            <Badge className="bg-green-500/20 border-green-500 text-green-400 text-xs">
                              Available
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Users className="h-3 w-3" />
                              <span>Capacity: {selectedHallData!.capacity} people</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">
                                ₹{selectedHallData!.capacity * movie.pricePerPerson}
                                <span className="text-xs font-normal text-gray-400"> (Full Hall)</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-purple-400 mt-2">Click to change hall</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Price Summary */}
            {selectedHallData && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Movie:</span>
                    <span className="font-medium text-gray-200">{movie.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hall:</span>
                    <span className="font-medium text-gray-200">{selectedHallData.name}</span>
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
                    <span className="font-medium text-gray-200">{selectedHallData.capacity} seats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price per Person:</span>
                    <span className="font-medium text-gray-200">₹{movie.pricePerPerson}</span>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">⚠️ Full Hall Booking</p>
                    <p className="text-xs text-gray-400">
                      You pay for the entire hall capacity ({selectedHallData.capacity} seats)
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
                    disabled={!selectedTimeSlot || !selectedHall}
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