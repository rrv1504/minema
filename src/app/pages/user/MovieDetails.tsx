import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Clock, IndianRupee, Calendar, Star } from 'lucide-react';

export default function MovieDetails() {
  const { movieId } = useParams();
  const { movies, currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const movie = movies.find(m => m.id === movieId);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

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
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Movie Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              </CardContent>
            </Card>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-red-500/10 to-purple-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl text-white mb-2">{movie.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {movie.duration}
                      </span>
                      <span>•</span>
                      <span>{movie.genre}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold text-lg px-3 py-1">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    {movie.rating}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">About the Movie</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {movie.description || `Experience ${movie.title}, a captivating ${movie.genre.toLowerCase()} film that will keep you entertained for ${movie.duration}. Perfect for group viewing, this movie offers an unforgettable cinematic experience.`}
                  </p>
                </div>

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
                        <p className="text-xs text-gray-500">IMDb Score</p>
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
                      <span>You will book the entire hall capacity for your group</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Total price = Hall capacity × ₹{movie.pricePerPerson} per person</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Choose from multiple available halls and time slots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Add snacks and beverages during checkout</span>
                    </li>
                  </ul>
                </div>

                {/* Book Now Button */}
                <Link to={`/user/movie-flow/${movie.id}`} className="block">
                  <Button 
                    className="w-full gradient-button glow-red border-0 py-6 text-lg"
                    size="lg"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book This Movie Now
                  </Button>
                </Link>

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
