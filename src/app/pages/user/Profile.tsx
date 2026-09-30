import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, User, Mail, Phone, Calendar, Users, Clock } from 'lucide-react';

export default function Profile() {
  const { currentUser, bookings } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const userBookings = bookings.filter(b => b.userName === currentUser?.name);

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
                <User className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Details */}
        <Card className="glass-card border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-400">Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                <User className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium text-white">{currentUser?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium text-white">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                <Phone className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="font-medium text-white">{currentUser?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking History */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Booking History</h2>
          <p className="text-gray-400 mb-6">
            Total bookings: {userBookings.length}
          </p>
        </div>

        {userBookings.length === 0 ? (
          <Card className="glass-card border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <p className="text-gray-400 mb-2">No bookings yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Start booking to see your history here
              </p>
              <Link to="/user/home">
                <Button className="gradient-button glow-red border-0">Browse Movies</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.slice().reverse().map(booking => (
              <Card key={booking.id} className="glass-card border-purple-500/20 hover:border-purple-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">{booking.movieName}</CardTitle>
                      <CardDescription className="mt-1 text-gray-400">
                        <span className="font-mono text-xs text-purple-300">{booking.id}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className={booking.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-0' : ''}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Film className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-gray-400">Hall</p>
                        <p className="font-medium text-gray-200">{booking.hallName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-gray-400">Time</p>
                        <p className="font-medium text-gray-200">{booking.timeSlot}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-gray-400">Group</p>
                        <p className="font-medium text-gray-200">{booking.groupSize} people</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-semibold text-red-500 text-lg">
                          ₹{booking.grandTotal}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/user/confirmation/${booking.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}