import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Clock } from 'lucide-react';

export default function SelectMovie() {
  const { currentUser, movies } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleMovieSelect = (movieId: string) => {
    navigate(`/user/movie-flow/${movieId}`);
  };

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
              <h1 className="text-xl font-bold text-white">Select Movie</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Choose Your Movie</h2>
          <p className="text-gray-400">Select a movie to see available halls and time slots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <Card 
              key={movie.id} 
              className="cinema-poster glass-card overflow-hidden border-purple-500/20 hover:border-red-500/50 transition-all cursor-pointer"
              onClick={() => handleMovieSelect(movie.id)}
            >
              <div className="aspect-[2/3] overflow-hidden bg-black/50">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-white">{movie.title}</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-0 glow-gold">
                    {movie.rating}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-3 w-3" />
                  {movie.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{movie.genre}</span>
                  <span className="font-semibold text-lg text-white">
                    ₹{movie.pricePerPerson}
                    <span className="text-sm font-normal text-gray-400">/person</span>
                  </span>
                </div>
                <Button className="w-full gradient-button glow-red border-0">
                  Select Movie
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
