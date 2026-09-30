import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, LogOut, User, Clock, Users, Calendar, ArrowRight, AlertCircle, Brain, Sparkles } from 'lucide-react';
import Slider from 'react-slick';

export default function UserHome() {
  const { currentUser, logout, movies, bookings, halls, operatingHours, getOperatingHoursForDate, initializeWeeklySchedule } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Initialize operating hours if not set
    if (operatingHours.length === 0) {
      initializeWeeklySchedule();
    }
  }, [initializeWeeklySchedule, operatingHours.length]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userBookings = bookings.filter(b => b.userName === currentUser?.name);

  // Get today's operating hours
  const today = new Date().toISOString().split('T')[0];
  const todaysHours = getOperatingHoursForDate(today);

  const hallsCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Film className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">Minema</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/user/profile">
                <Button variant="ghost" size="sm" className="hover:bg-purple-500/10 hover:text-purple-300">
                  <User className="h-4 w-4 mr-2" />
                  {currentUser?.name}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome back, {currentUser?.name}!</h2>
          <p className="text-gray-400">Book an entire movie hall for your group</p>
        </div>

        {/* Today's Operating Hours Banner */}
        {todaysHours && (
          <Card className="glass-card border-red-500/40 glow-red mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-red-500/40">
                  <Clock className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-1">Today's Operating Hours</h3>
                  <p className="text-gray-400 text-sm">
                    Bookings available from <span className="text-red-400 font-semibold">{todaysHours.startTime}</span> to <span className="text-red-400 font-semibold">{todaysHours.endTime}</span>
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-purple-600/10 px-4 py-2 rounded-lg border border-purple-500/30">
                  <AlertCircle className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Book up to 1 week in advance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations Banner */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl glass-card border border-purple-500/30 glow-purple">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/8 to-purple-600/12 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
              <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-5 rounded-2xl border border-purple-500/30 shrink-0">
                <Brain className="h-10 w-10 text-purple-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">ML-Powered</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5">Not sure what to watch?</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                  Our AI analyses your group's mood, personal history, and booking patterns to recommend movies everyone will love — and predicts if your plan might fall through.
                </p>
              </div>
              <Link to="/user/recommendations" className="shrink-0">
                <Button className="gradient-button glow-red border-0 px-6 whitespace-nowrap">
                  Get AI Picks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Booking Path Selection */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-white">Choose Your Booking Path</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-purple-500/30 hover:border-red-500/50 transition-all cursor-pointer glow-purple group">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-6 rounded-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <Film className="h-12 w-12 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Select Movie First</h4>
                    <p className="text-gray-400 mb-4">
                      Choose your favorite movie, then pick a hall and time slot
                    </p>
                  </div>
                  <Link to="/user/select-movie" className="w-full">
                    <Button className="w-full gradient-button glow-red border-0 group-hover:scale-105 transition-transform">
                      Browse Movies
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer glow-purple group">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-6 rounded-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <Users className="h-12 w-12 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Select Hall First</h4>
                    <p className="text-gray-400 mb-4">
                      Choose your preferred hall, then pick a movie and time slot
                    </p>
                  </div>
                  <Link to="/user/select-hall" className="w-full">
                    <Button className="w-full gradient-button glow-purple border-0 group-hover:scale-105 transition-transform">
                      Browse Halls
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Available Halls Carousel */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-white">Available Halls</h3>
          <div className="halls-carousel">
            <Slider {...hallsCarouselSettings}>
              {halls.filter(h => h.isActive).map(hall => (
                <div key={hall.id} className="px-3">
                  <Link to={`/user/hall/${hall.id}`}>
                    <Card className="glass-card border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group">
                      <div className="aspect-video overflow-hidden bg-black/50">
                        <img
                          src={hall.imageUrl}
                          alt={hall.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader className="p-[24px]">
                        <CardTitle className="text-white group-hover:text-purple-400 transition-colors">{hall.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-400">
                          <Users className="h-4 w-4" />
                          Capacity: {hall.capacity} people
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Movies Grid */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-white">Now Showing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map(movie => (
              <Link key={movie.id} to={`/user/movie/${movie.id}`}>
                <Card className="cinema-poster glass-card overflow-hidden border-purple-500/20 hover:border-red-500/50 transition-all cursor-pointer group h-full">
                  <div className="aspect-[2/3] overflow-hidden bg-black/50">
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg text-white group-hover:text-red-400 transition-colors">{movie.title}</CardTitle>
                      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold">{movie.rating}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-3 w-3" />
                      {movie.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">{movie.genre}</span>
                      <span className="font-semibold text-lg text-white">₹{movie.pricePerPerson}<span className="text-sm font-normal text-gray-400">/person</span></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Past Bookings */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-white">Your Past Bookings</h3>
          {userBookings.length === 0 ? (
            <Card className="glass-card border-purple-500/20">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">No bookings yet</p>
                <p className="text-sm text-gray-500 mt-1">Book a movie hall to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.slice().reverse().map(booking => (
                <Card key={booking.id} className="glass-card border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{booking.movieName}</CardTitle>
                    <CardDescription className="text-gray-400">Booking ID: {booking.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Film className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-400">Hall:</span>
                      <span className="font-medium text-gray-200">{booking.hallName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-400">Hall Capacity:</span>
                      <span className="font-medium text-gray-200">{booking.hallCapacity} people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-400">Time:</span>
                      <span className="font-medium text-gray-200">{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm pt-2 border-t border-purple-500/20">
                      <span className="text-gray-400">Total Paid:</span>
                      <span className="font-semibold text-lg text-red-500">₹{booking.grandTotal}</span>
                    </div>
                    <Link to={`/user/confirmation/${booking.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}