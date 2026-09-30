import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArrowLeft, Film, Save, X } from 'lucide-react';

export default function CreateEditMovie() {
  const { movieId } = useParams();
  const { movies, currentUser, addMovie, updateMovie } = useApp();
  const navigate = useNavigate();
  const isEditing = !!movieId;
  const movie = isEditing ? movies.find(m => m.id === movieId) : null;

  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    pricePerPerson: '',
    genre: '',
    rating: '',
    imageUrl: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        duration: movie.duration,
        pricePerPerson: movie.pricePerPerson.toString(),
        genre: movie.genre,
        rating: movie.rating,
        imageUrl: movie.imageUrl,
        description: movie.description,
      });
    }
  }, [movie]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Movie title is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else {
      const durationMatch = formData.duration.match(/(\d+)h\s*(\d+)?m?/);
      if (!durationMatch) {
        newErrors.duration = 'Invalid format. Use format like "2h 30m" or "1h 45m"';
      }
    }

    if (!formData.pricePerPerson) {
      newErrors.pricePerPerson = 'Price is required';
    } else if (parseFloat(formData.pricePerPerson) <= 0) {
      newErrors.pricePerPerson = 'Price must be greater than 0';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }

    if (!formData.rating.trim()) {
      newErrors.rating = 'Rating is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate durationMinutes from duration string
    const durationMatch = formData.duration.match(/(\d+)h\s*(\d+)?m?/);
    let durationMinutes = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || '0');
      durationMinutes = hours * 60 + minutes;
    }

    const movieData = {
      ...formData,
      pricePerPerson: parseFloat(formData.pricePerPerson),
      durationMinutes,
    };

    if (isEditing && movieId) {
      updateMovie(movieId, movieData);
    } else {
      addMovie(movieData);
    }

    navigate('/admin/movies');
  };

  const handleCancel = () => {
    navigate('/admin/movies');
  };

  if (isEditing && !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Card className="glass-card border-purple-500/20 p-8">
          <p className="text-gray-400 text-center">Movie not found</p>
          <Button 
            className="mt-4 w-full"
            onClick={() => navigate('/admin/movies')}
          >
            Back to Movies
          </Button>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Movie' : 'Add New Movie'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-card border-purple-500/20">
          <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-red-500/10 to-purple-500/10">
            <CardTitle className="text-white">
              {isEditing ? 'Update Movie Details' : 'Movie Information'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isEditing 
                ? 'Modify the movie information below' 
                : 'Fill in the details to add a new movie to your catalog'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Movie Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  Movie Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Inception"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Duration and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">
                    Duration *
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2h 30m"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-400">{errors.duration}</p>
                  )}
                  <p className="text-xs text-gray-500">Format: "2h 30m" or "1h 45m"</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">
                    Price per Person (₹) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerPerson}
                    onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                    placeholder="e.g., 250"
                    className={errors.pricePerPerson ? 'border-red-500' : ''}
                  />
                  {errors.pricePerPerson && (
                    <p className="text-sm text-red-400">{errors.pricePerPerson}</p>
                  )}
                </div>
              </div>

              {/* Genre and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white">
                    Genre *
                  </Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                    <SelectTrigger className={`glass-card-light border-purple-500/30 text-white focus:border-purple-500/50 ${errors.genre ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-purple-500/30">
                      <SelectItem value="Action" className="text-white focus:bg-purple-500/20">Action</SelectItem>
                      <SelectItem value="Adventure" className="text-white focus:bg-purple-500/20">Adventure</SelectItem>
                      <SelectItem value="Animation" className="text-white focus:bg-purple-500/20">Animation</SelectItem>
                      <SelectItem value="Comedy" className="text-white focus:bg-purple-500/20">Comedy</SelectItem>
                      <SelectItem value="Drama" className="text-white focus:bg-purple-500/20">Drama</SelectItem>
                      <SelectItem value="Fantasy" className="text-white focus:bg-purple-500/20">Fantasy</SelectItem>
                      <SelectItem value="Horror" className="text-white focus:bg-purple-500/20">Horror</SelectItem>
                      <SelectItem value="Romance" className="text-white focus:bg-purple-500/20">Romance</SelectItem>
                      <SelectItem value="Sci-Fi" className="text-white focus:bg-purple-500/20">Sci-Fi</SelectItem>
                      <SelectItem value="Superhero" className="text-white focus:bg-purple-500/20">Superhero</SelectItem>
                      <SelectItem value="Thriller" className="text-white focus:bg-purple-500/20">Thriller</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.genre && (
                    <p className="text-sm text-red-400">{errors.genre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-white">
                    Rating *
                  </Label>
                  <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                    <SelectTrigger className={`glass-card-light border-purple-500/30 text-white focus:border-purple-500/50 ${errors.rating ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-purple-500/30">
                      <SelectItem value="G" className="text-white focus:bg-purple-500/20">G - General Audiences</SelectItem>
                      <SelectItem value="PG" className="text-white focus:bg-purple-500/20">PG - Parental Guidance</SelectItem>
                      <SelectItem value="PG-13" className="text-white focus:bg-purple-500/20">PG-13 - Parents Strongly Cautioned</SelectItem>
                      <SelectItem value="R" className="text-white focus:bg-purple-500/20">R - Restricted</SelectItem>
                      <SelectItem value="NC-17" className="text-white focus:bg-purple-500/20">NC-17 - Adults Only</SelectItem>
                      <SelectItem value="U" className="text-white focus:bg-purple-500/20">U - Universal</SelectItem>
                      <SelectItem value="UA" className="text-white focus:bg-purple-500/20">UA - Parental Guidance (India)</SelectItem>
                      <SelectItem value="A" className="text-white focus:bg-purple-500/20">A - Adults (India)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rating && (
                    <p className="text-sm text-red-400">{errors.rating}</p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-white">
                  Movie Poster URL *
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/poster.jpg"
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-400">{errors.imageUrl}</p>
                )}
                <p className="text-xs text-gray-500">Recommended aspect ratio: 2:3 (portrait)</p>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label className="text-white">Preview</Label>
                  <div className="w-48 aspect-[2/3] rounded-lg overflow-hidden border border-purple-500/20">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=Invalid+Image';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  About / Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a brief description about the movie, its plot, and what makes it special..."
                  className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50 min-h-[120px]"
                  rows={5}
                />
                <p className="text-xs text-gray-500">Optional: Add details about the movie to help users make an informed decision</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-purple-500/20">
                <Button
                  type="submit"
                  className="flex-1 gradient-button glow-purple border-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Movie' : 'Create Movie'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-purple-500/30 hover:bg-purple-500/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}