import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, Film, Users, Clock, IndianRupee, Home } from 'lucide-react';

export default function Confirmation() {
  const { bookingId } = useParams();
  const { bookings, currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 mb-4">Booking not found</p>
            <Link to="/user/home">
              <Button className="gradient-button glow-red border-0">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 vignette spotlight">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 glow-gold animate-pulse">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Booking Confirmed!</h1>
          <p className="text-gray-400">
            Your hall has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="glass-card border-purple-500/30 mb-6 glow-purple">
          <CardHeader className="border-b border-purple-500/30 bg-gradient-to-r from-red-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {booking.movieImageUrl && (
                  <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={booking.movieImageUrl}
                      alt={booking.movieName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl text-white">{booking.movieName}</CardTitle>
                  <CardDescription className="mt-1 text-gray-400">
                    Booking ID: <span className="font-mono font-medium text-purple-300">{booking.id}</span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="h-fit bg-gradient-to-r from-green-500 to-emerald-600 border-0 glow-gold">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Confirmed
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Hall & Time Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                  <Film className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Hall</p>
                  <p className="font-semibold text-white">{booking.hallName}</p>
                  <p className="text-sm text-gray-500">
                    Capacity: {booking.hallCapacity}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time Slot</p>
                  <p className="font-semibold text-white">{booking.timeSlot}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Hall Capacity</p>
                  <p className="font-semibold text-white">{booking.hallCapacity} people</p>
                  <p className="text-xs text-yellow-400">Full hall booking</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                  <IndianRupee className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Paid</p>
                  <p className="font-bold text-2xl text-white bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">₹{booking.grandTotal}</p>
                </div>
              </div>
            </div>

            {/* Snacks */}
            {booking.snacks && booking.snacks.length > 0 && (
              <div className="border-t border-purple-500/20 pt-6">
                <h3 className="font-semibold mb-3 text-white">Snacks Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.snacks.map((snack, index) => (
                    <div key={index} className="glass-card-light rounded-lg p-3 flex items-center gap-3">
                      {snack.imageUrl && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={snack.imageUrl}
                            alt={snack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{snack.name}</p>
                        <p className="text-sm font-bold text-red-500">₹{snack.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-purple-500/20 pt-6">
              <h3 className="font-semibold mb-3 text-white">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Hall Booking (Full Capacity: {booking.hallCapacity} seats)</span>
                  <span className="font-medium text-gray-200">₹{booking.hallPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Snacks</span>
                  <span className="font-medium text-gray-200">₹{booking.snacksTotal}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-purple-500/20 pt-2">
                  <span className="text-white">Total Amount Paid</span>
                  <span className="text-red-500 glow-red">₹{booking.grandTotal}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="glass-card border-purple-500/20 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-white">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Please arrive 15 minutes before the showtime</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Show this booking confirmation at the entrance</li>
              <li>• Outside food and beverages are not allowed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/user/home" className="flex-1">
            <Button variant="default" size="lg" className="w-full gradient-button glow-red border-0">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>
          <Link to="/user/profile" className="flex-1">
            <Button variant="outline" size="lg" className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
              View All Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}