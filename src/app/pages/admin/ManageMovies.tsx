import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { ArrowLeft, LayoutDashboard, Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export default function ManageMovies() {
  const { currentUser, movies, addMovie, updateMovie, deleteMovie } = useApp();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate durationMinutes from duration string (e.g., "2h 30m" -> 150)
    const durationMatch = formData.duration.match(/(\d+)h\s*(\d+)?m?/);
    let durationMinutes = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || '0');
      durationMinutes = hours * 60 + minutes;
    }
    
    if (editingMovie) {
      updateMovie(editingMovie.id, {
        ...formData,
        pricePerPerson: parseFloat(formData.pricePerPerson),
        durationMinutes,
      });
    } else {
      addMovie({
        ...formData,
        pricePerPerson: parseFloat(formData.pricePerPerson),
        durationMinutes,
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      pricePerPerson: '',
      genre: '',
      rating: '',
      imageUrl: '',
    });
    setEditingMovie(null);
  };

  const handleEdit = (movie: any) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      duration: movie.duration,
      pricePerPerson: movie.pricePerPerson.toString(),
      genre: movie.genre,
      rating: movie.rating,
      imageUrl: movie.imageUrl,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                  <ArrowLeft className="h-5 w-5 text-gray-300" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Manage Movies</h1>
              </div>
            </div>
            <Link to="/admin/movie/new">
              <Button className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Movie
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <Card key={movie.id} className="overflow-hidden glass-card border-purple-500/20 hover:border-purple-500/40 hover:glow-purple transition-all">
              <Link to={`/admin/movie/${movie.id}`} className="block">
                <div className="aspect-[2/3] overflow-hidden bg-gray-900 cursor-pointer">
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <CardContent className="p-4 space-y-3">
                <Link to={`/admin/movie/${movie.id}`} className="block hover:opacity-80 transition-opacity">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold leading-tight text-white">{movie.title}</h3>
                      <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">{movie.rating}</Badge>
                    </div>
                    <p className="text-sm text-gray-400">{movie.genre} • {movie.duration}</p>
                    <p className="text-lg font-semibold text-red-500 mt-2">₹{movie.pricePerPerson}/person</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link to={`/admin/movie/${movie.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-gray-300"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50 text-red-400"
                    onClick={() => {
                      if (confirm('Delete this movie?')) {
                        deleteMovie(movie.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}