import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Film, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function SnackSelection() {
  const { snacks, currentUser } = useApp();
  const navigate = useNavigate();
  const [selectedSnacks, setSelectedSnacks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSnackToggle = (snackId: string) => {
    setSelectedSnacks(prev => ({
      ...prev,
      [snackId]: !prev[snackId],
    }));
  };

  const selectedSnacksList = snacks.filter(s => selectedSnacks[s.id]);
  const snacksTotal = selectedSnacksList.reduce((sum, s) => sum + s.price, 0);

  const handleContinue = () => {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
    sessionStorage.setItem('bookingData', JSON.stringify({
      ...bookingData,
      snacks: selectedSnacksList.map(s => ({ name: s.name, price: s.price, imageUrl: s.imageUrl })),
      snacksTotal,
    }));
    navigate('/user/payment');
  };

  const handleSkip = () => {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
    sessionStorage.setItem('bookingData', JSON.stringify({
      ...bookingData,
      snacks: [],
      snacksTotal: 0,
    }));
    navigate('/user/payment');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/home">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Add Snacks</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-white">Enhance Your Experience</h2>
          <p className="text-gray-400">Select snacks for your group (optional)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Snacks List */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {snacks.filter(s => s.isActive).map(snack => (
                <Card
                  key={snack.id}
                  className={`cursor-pointer transition-all glass-card border-purple-500/20 overflow-hidden ${
                    selectedSnacks[snack.id] ? 'glow-purple border-purple-500/50' : 'hover:border-purple-500/30'
                  }`}
                  onClick={() => handleSnackToggle(snack.id)}
                >
                  <div className="aspect-video overflow-hidden bg-black/50">
                    <img
                      src={snack.imageUrl}
                      alt={snack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSnacks[snack.id] || false}
                        onCheckedChange={() => handleSnackToggle(snack.id)}
                        className="border-purple-500/50 mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-white">{snack.name}</h3>
                        <p className="text-lg font-bold text-red-500">₹{snack.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="md:col-span-1">
            <Card className="glass-card border-purple-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
                <CardDescription className="text-gray-400">Selected snacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSnacksList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No snacks selected
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSnacksList.map(snack => (
                      <div key={snack.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">{snack.name}</span>
                        <span className="font-medium text-gray-200">₹{snack.price}</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-500/20 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Snacks Total:</span>
                      <span className="text-red-500 glow-red">₹{snacksTotal}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-purple-500/20">
                  <Button className="w-full gradient-button glow-red border-0" onClick={handleContinue}>
                    Continue to Payment
                  </Button>
                  <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50" onClick={handleSkip}>
                    Skip Snacks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}