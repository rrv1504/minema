import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { Home, ArrowLeft, Users, Pencil, TrendingUp } from 'lucide-react';

export default function AdminHallDetails() {
  const { hallId } = useParams();
  const { halls, currentUser, bookings, updateHall } = useApp();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const hall = halls.find(h => h.id === hallId);

  useEffect(() => {
    if (hall) {
      setFormData({
        name: hall.name,
        capacity: hall.capacity.toString(),
        imageUrl: hall.imageUrl,
        isActive: hall.isActive,
      });
    }
  }, [hall]);

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Hall not found</p>
      </div>
    );
  }

  const hallBookings = bookings.filter(b => b.hallId === hall.id);
  const totalRevenue = hallBookings.reduce((sum, b) => sum + b.grandTotal, 0);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateHall(hall.id, {
      ...formData,
      capacity: parseInt(formData.capacity),
    });
    setIsEditDialogOpen(false);
  };

  const handleToggleActive = () => {
    updateHall(hall.id, {
      isActive: !hall.isActive,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/halls">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Hall Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hall Image */}
          <div className="lg:col-span-1">
            <Card className="cinema-poster glass-card border-purple-500/20 overflow-hidden sticky top-8">
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
                    <Badge variant={hall.isActive ? 'default' : 'secondary'} className={hall.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                      {hall.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Capacity</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-medium">{hall.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                    <span className="text-sm text-gray-400">Total Bookings</span>
                    <span className="text-xl font-bold text-purple-500">{hallBookings.length}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  <Link to={`/admin/hall/${hall.id}/edit`}>
                    <Button 
                      className="w-full gradient-button glow-purple border-0"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Hall
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className={`w-full ${
                      hall.isActive 
                        ? 'border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-400'
                        : 'border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-green-400'
                    }`}
                    onClick={handleToggleActive}
                  >
                    {hall.isActive ? 'Deactivate Hall' : 'Activate Hall'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hall Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{hallBookings.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">₹{totalRevenue}</div>
                  <p className="text-xs text-gray-500 mt-1">From this hall</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Avg. Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">
                    ₹{hallBookings.length > 0 ? Math.round(totalRevenue / hallBookings.length) : 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per booking</p>
                </CardContent>
              </Card>
            </div>

            {/* Hall Details Card */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-red-500/10 to-purple-500/10">
                <CardTitle className="text-2xl text-white">{hall.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {hall.capacity}
                  </span>
                  <span>•</span>
                  <span className={hall.isActive ? 'text-green-400' : 'text-gray-500'}>
                    {hall.isActive ? 'Active' : 'Inactive'}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* About Section */}
                {hall.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About the Hall</h3>
                    <p className="text-gray-400 leading-relaxed">{hall.description}</p>
                  </div>
                )}

                {/* Key Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Users className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Maximum Capacity</p>
                        <p className="font-semibold text-white">{hall.capacity} seats</p>
                        <p className="text-xs text-gray-500">Full hall booking</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Home className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hall Status</p>
                        <p className="font-semibold text-white">{hall.isActive ? 'Active' : 'Inactive'}</p>
                        <p className="text-xs text-gray-500">{hall.isActive ? 'Available for booking' : 'Not available'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Bookings</p>
                        <p className="font-semibold text-white">{hallBookings.length}</p>
                        <p className="text-xs text-gray-500">All time</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <TrendingUp className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Revenue</p>
                        <p className="font-semibold text-white">₹{totalRevenue}</p>
                        <p className="text-xs text-gray-500">From this hall</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="border-b border-purple-500/20">
                <CardTitle className="text-white">Recent Bookings</CardTitle>
                <CardDescription className="text-gray-400">Latest bookings for this hall</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="glass-card-light border-b border-purple-500/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Movie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time Slot</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {hallBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            No bookings for this hall yet
                          </td>
                        </tr>
                      ) : (
                        hallBookings.slice(-10).reverse().map(booking => (
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
                              {booking.timeSlot}
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
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md glass-card border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Hall</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update hall details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hall Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Hall
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}