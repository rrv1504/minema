import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Film, ArrowLeft, Clock, IndianRupee, Star, Pencil, Trash2, TrendingUp } from 'lucide-react';

export default function AdminMovieDetails() {
  const { movieId } = useParams();
  const { movies, currentUser, bookings, updateMovie, deleteMovie } = useApp();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    pricePerPerson: '',
    genre: '',
    rating: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const movie = movies.find(m => m.id === movieId);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        duration: movie.duration,
        pricePerPerson: movie.pricePerPerson.toString(),
        genre: movie.genre,
        rating: movie.rating,
        imageUrl: movie.imageUrl,
      });
    }
  }, [movie]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  const movieBookings = bookings.filter(b => b.movieId === movie.id);
  const totalRevenue = movieBookings.reduce((sum, b) => sum + b.grandTotal, 0);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const durationMatch = formData.duration.match(/(\d+)h\s*(\d+)?m?/);
    let durationMinutes = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || '0');
      durationMinutes = hours * 60 + minutes;
    }
    
    updateMovie(movie.id, {
      ...formData,
      pricePerPerson: parseFloat(formData.pricePerPerson),
      durationMinutes,
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${movie.title}"? This action cannot be undone.`)) {
      deleteMovie(movie.id);
      navigate('/admin/movies');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/movies">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Movie Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <Card className="cinema-poster glass-card border-purple-500/20 overflow-hidden sticky top-8">
              <div className="aspect-[2/3] overflow-hidden bg-black/50">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Rating</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {movie.rating}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Genre</span>
                    <Badge className="bg-purple-500/20 border-purple-500 text-purple-300">
                      {movie.genre}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Duration</span>
                    <span className="text-white font-medium">{movie.duration}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                    <span className="text-sm text-gray-400">Price per Person</span>
                    <span className="text-xl font-bold text-red-500 glow-red">₹{movie.pricePerPerson}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  <Link to={`/admin/movie/${movie.id}/edit`}>
                    <Button 
                      className="w-full gradient-button glow-purple border-0"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Movie
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive"
                    className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50 text-red-400 mx-[0px] my-[10px]"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Movie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{movieBookings.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">₹{totalRevenue}</div>
                  <p className="text-xs text-gray-500 mt-1">From this movie</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Avg. Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">
                    ₹{movieBookings.length > 0 ? Math.round(totalRevenue / movieBookings.length) : 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per booking</p>
                </CardContent>
              </Card>
            </div>

            {/* Movie Details Card */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-red-500/10 to-purple-500/10">
                <CardTitle className="text-2xl text-white">{movie.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {movie.duration}
                  </span>
                  <span>•</span>
                  <span>{movie.genre}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* About Section */}
                {movie.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About the Movie</h3>
                    <p className="text-gray-400 leading-relaxed">{movie.description}</p>
                  </div>
                )}

                {/* Key Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Runtime</p>
                        <p className="font-semibold text-white">{movie.duration}</p>
                        <p className="text-xs text-gray-500">{movie.durationMinutes} minutes</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <IndianRupee className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Ticket Price</p>
                        <p className="font-semibold text-white">₹{movie.pricePerPerson}</p>
                        <p className="text-xs text-gray-500">Per person</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Film className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Genre</p>
                        <p className="font-semibold text-white">{movie.genre}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Rating</p>
                        <p className="font-semibold text-white">{movie.rating}</p>
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
                <CardDescription className="text-gray-400">Latest bookings for this movie</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="glass-card-light border-b border-purple-500/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hall</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time Slot</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {movieBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            No bookings for this movie yet
                          </td>
                        </tr>
                      ) : (
                        movieBookings.slice(-10).reverse().map(booking => (
                          <tr key={booking.id} className="hover:bg-purple-500/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-300">
                              {booking.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {booking.userName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {booking.hallName}
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
            <DialogTitle className="text-white">Edit Movie</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update movie details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Movie Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="2h 30m"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price/Person</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  placeholder="PG-13"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                />
              </div>
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
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Movie
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