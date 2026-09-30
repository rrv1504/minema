import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { ArrowLeft, Home, Save, X, Users } from 'lucide-react';

export default function CreateEditHall() {
  const { hallId } = useParams();
  const { halls, currentUser, addHall, updateHall } = useApp();
  const navigate = useNavigate();
  const isEditing = !!hallId;
  const hall = isEditing ? halls.find(h => h.id === hallId) : null;

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    imageUrl: '',
    isActive: true,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (hall) {
      setFormData({
        name: hall.name,
        capacity: hall.capacity.toString(),
        imageUrl: hall.imageUrl,
        isActive: hall.isActive,
        description: hall.description || '',
      });
    }
  }, [hall]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hall name is required';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    } else if (parseInt(formData.capacity) > 1000) {
      newErrors.capacity = 'Capacity cannot exceed 1000';
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

    const hallData = {
      ...formData,
      capacity: parseInt(formData.capacity),
    };

    if (isEditing && hallId) {
      updateHall(hallId, hallData);
    } else {
      addHall(hallData);
    }

    navigate('/admin/halls');
  };

  const handleCancel = () => {
    navigate('/admin/halls');
  };

  if (isEditing && !hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Card className="glass-card border-purple-500/20 p-8">
          <p className="text-gray-400 text-center">Hall not found</p>
          <Button 
            className="mt-4 w-full"
            onClick={() => navigate('/admin/halls')}
          >
            Back to Halls
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
            <Link to="/admin/halls">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Hall' : 'Add New Hall'}
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
              {isEditing ? 'Update Hall Details' : 'Hall Information'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isEditing 
                ? 'Modify the hall information below' 
                : 'Fill in the details to add a new hall to your venue'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hall Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Hall Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grand Theater, IMAX Hall 1"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-white">
                  Seating Capacity *
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 150"
                    className={`pl-10 ${errors.capacity ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.capacity && (
                  <p className="text-sm text-red-400">{errors.capacity}</p>
                )}
                <p className="text-xs text-gray-500">Maximum capacity: 1000 seats</p>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-white">
                  Hall Image URL *
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/hall-image.jpg"
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-400">{errors.imageUrl}</p>
                )}
                <p className="text-xs text-gray-500">Recommended aspect ratio: 16:9 (landscape)</p>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label className="text-white">Preview</Label>
                  <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden border border-purple-500/20">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Invalid+Image';
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
                  placeholder="Enter a brief description of the hall, its features, amenities, and what makes it special..."
                  className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50 min-h-[120px]"
                  rows={5}
                />
                <p className="text-xs text-gray-500">Optional: Add details about the hall to help users understand what to expect</p>
              </div>

              {/* Active Status */}
              <div className="glass-card-light rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isActive" className="text-white text-base">
                      Active Status
                    </Label>
                    <p className="text-sm text-gray-400">
                      {formData.isActive 
                        ? 'This hall is available for bookings' 
                        : 'This hall is disabled and not available for bookings'}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              {/* Summary Card */}
              {formData.name && formData.capacity && (
                <div className="glass-card-light rounded-lg p-6 border border-purple-500/20 bg-gradient-to-r from-red-500/5 to-purple-500/5">
                  <h3 className="text-white font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Hall Name</p>
                      <p className="text-white font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Capacity</p>
                      <p className="text-white font-medium">{formData.capacity} seats</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className={`font-medium ${formData.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Availability</p>
                      <p className="text-white font-medium">
                        {formData.isActive ? 'Available for booking' : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-purple-500/20">
                <Button
                  type="submit"
                  className="flex-1 gradient-button glow-purple border-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Hall' : 'Create Hall'}
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