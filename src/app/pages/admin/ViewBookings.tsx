import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, List } from 'lucide-react';

export default function ViewBookings() {
  const { currentUser, bookings } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10"><ArrowLeft className="h-5 w-5 text-gray-300" /></Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <List className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">All Bookings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-500/10 border-b border-purple-500/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Movie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Hall</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No bookings found</td>
                    </tr>
                  ) : (
                    bookings.slice().reverse().map(booking => (
                      <tr key={booking.id} className="hover:bg-purple-500/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{booking.movieName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.hallName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.timeSlot}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.groupSize}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">₹{booking.grandTotal}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}