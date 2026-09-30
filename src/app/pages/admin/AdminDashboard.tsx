import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Film, LogOut, LayoutDashboard, Ticket, Home, Popcorn, List, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, logout, bookings, movies, halls, snacks } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + b.grandTotal, 0);
  const activeMovies = movies.length;
  const activeHalls = halls.filter(h => h.isActive).length;
  const totalBookings = bookings.length;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Ticket,
      description: 'All time',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Movies',
      value: activeMovies,
      icon: Film,
      description: 'Currently showing',
      color: 'bg-purple-500',
    },
    {
      title: 'Active Halls',
      value: activeHalls,
      icon: Home,
      description: 'Available now',
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue}`,
      icon: Ticket,
      description: 'All transactions',
      color: 'bg-orange-500',
    },
  ];

  const quickLinks = [
    {
      title: 'Manage Movies',
      description: 'Add, edit, or remove movies',
      icon: Film,
      href: '/admin/movies',
      color: 'bg-purple-500',
    },
    {
      title: 'Manage Halls',
      description: 'Configure hall availability',
      icon: Home,
      href: '/admin/halls',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Snacks',
      description: 'Update snack menu & prices',
      icon: Popcorn,
      href: '/admin/snacks',
      color: 'bg-green-500',
    },
    {
      title: 'Operating Hours',
      description: 'Set daily operating hours',
      icon: Clock,
      href: '/admin/timeslots',
      color: 'bg-red-500',
    },
    {
      title: 'View Bookings',
      description: 'See all customer bookings',
      icon: List,
      href: '/admin/bookings',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Minema Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{currentUser?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`bg-gradient-to-br from-${stat.color.replace('bg-', '')}/20 to-${stat.color.replace('bg-', '')}/10 p-2 rounded-lg border border-purple-500/30`}>
                  <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 hover:glow-purple transition-all cursor-pointer h-full">
                  <CardHeader className="p-[24px]">
                    <div className={`bg-gradient-to-br from-${link.color.replace('bg-', '')}/20 to-${link.color.replace('bg-', '')}/10 p-3 rounded-lg w-fit mb-3 border border-purple-500/30`}>
                      <link.icon className={`h-6 w-6 ${link.color.replace('bg-', 'text-')}`} />
                    </div>
                    <CardTitle className="text-lg text-white">{link.title}</CardTitle>
                    <CardDescription className="text-gray-400">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Recent Bookings</h2>
            <Link to="/admin/bookings">
              <Button variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50">
                View All
              </Button>
            </Link>
          </div>
          <Card className="glass-card border-purple-500/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="glass-card-light border-b border-purple-500/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Movie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hall
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          No bookings yet
                        </td>
                      </tr>
                    ) : (
                      bookings.slice(-5).reverse().map(booking => (
                        <tr key={booking.id} className="hover:bg-purple-500/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-300">
                            {booking.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {booking.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {booking.movieName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {booking.hallName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">
                            ₹{booking.grandTotal}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}