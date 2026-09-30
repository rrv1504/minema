import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Film, ArrowLeft, Users } from 'lucide-react';
import { calculateHallAvailability } from '@/app/utils/hallAvailability';

export default function SelectHall() {
  const { currentUser, halls, bookings } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleHallSelect = (hallId: string) => {
    navigate(`/user/hall-flow/${hallId}`);
  };

  const activeHalls = halls.filter(h => h.isActive);

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
              <h1 className="text-xl font-bold text-white">Select Hall</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Choose Your Hall</h2>
          <p className="text-gray-400">Select a hall to see available movies and time slots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeHalls.map(hall => {
            const availability = calculateHallAvailability(hall.id, bookings);
            
            return (
            <Card 
              key={hall.id} 
              className="glass-card overflow-hidden border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => handleHallSelect(hall.id)}
            >
              <div className="aspect-video overflow-hidden bg-black/50 relative">
                <img
                  src={hall.imageUrl}
                  alt={hall.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={`${availability.color} border`}>
                    {availability.emoji} {availability.label}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl">{hall.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  Capacity: {hall.capacity} people
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gradient-button glow-purple border-0">
                  Select Hall
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}