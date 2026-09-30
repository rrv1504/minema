import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Users, IndianRupee, Calendar, CheckCircle, Building2 } from 'lucide-react';
import { calculateHallAvailability } from '@/app/utils/hallAvailability';

export default function HallDetails() {
  const { hallId } = useParams();
  const { halls, currentUser, bookings } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const hall = halls.find(h => h.id === hallId);

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Hall not found</p>
      </div>
    );
  }

  const availability = calculateHallAvailability(hall.id, bookings);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/home">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Hall Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hall Image */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-purple-500/20 overflow-hidden sticky top-8">
              <div className="aspect-video overflow-hidden bg-black/50">
                <img
                  src={hall.imageUrl}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <Badge className={`${availability.color} border`}>
                      {availability.emoji} {availability.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Hall Type</span>
                    <Badge className="bg-purple-500/20 border-purple-500 text-purple-300">
                      Premium
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                    <span className="text-sm text-gray-400">Capacity</span>
                    <span className="text-xl font-bold text-white">{hall.capacity} seats</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hall Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-red-500/10 to-purple-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl text-white mb-2">{hall.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Capacity: {hall.capacity} people
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={`${availability.color} border text-sm px-3 py-1`}>
                    {availability.emoji} {availability.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">About the Hall</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {hall.description || `${hall.name} is a premium cinema hall designed for group bookings. With a capacity of ${hall.capacity} seats, it offers a luxurious and immersive movie-watching experience. The hall features state-of-the-art sound systems, comfortable seating, and excellent screen quality for an unforgettable cinematic experience.`}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Hall Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: CheckCircle, text: 'Dolby Atmos Sound System' },
                      { icon: CheckCircle, text: 'Premium Recliner Seats' },
                      { icon: CheckCircle, text: '4K Laser Projection' },
                      { icon: CheckCircle, text: 'Air Conditioned' },
                      { icon: CheckCircle, text: 'Spacious Legroom' },
                      { icon: CheckCircle, text: 'Emergency Exits' },
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <feature.icon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Users className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Capacity</p>
                        <p className="font-semibold text-white">{hall.capacity} Seats</p>
                        <p className="text-xs text-gray-500">Full hall booking</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Building2 className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hall Type</p>
                        <p className="font-semibold text-white">Premium</p>
                        <p className="text-xs text-gray-500">Luxury experience</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-gradient-to-r from-purple-500/10 to-red-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Booking Information</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>You will book the entire hall ({hall.capacity} seats) for your group</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Total price depends on the movie selected (Movie price × {hall.capacity})</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Choose from multiple available movies and time slots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Add snacks and beverages during checkout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Operating hours: 10:00 AM - 12:00 AM (Midnight)</span>
                    </li>
                  </ul>
                </div>

                {/* Book Now Button */}
                {hall.isActive ? (
                  <Link to={`/user/hall-flow/${hall.id}`} className="block">
                    <Button 
                      className="w-full gradient-button glow-red border-0 py-6 text-lg"
                      size="lg"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Book This Hall Now
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full gradient-button border-0 py-6 text-lg opacity-50"
                    size="lg"
                    disabled
                  >
                    Hall Currently Unavailable
                  </Button>
                )}

                {/* Back Button */}
                <Link to="/user/home" className="block">
                  <Button 
                    variant="outline"
                    className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
