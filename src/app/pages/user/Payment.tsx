import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Film, ArrowLeft, CreditCard, Smartphone, Wallet, Check } from 'lucide-react';

export default function Payment() {
  const { addBooking, currentUser } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      navigate('/');
      return;
    }

    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/user/home');
      return;
    }
    setBookingData(JSON.parse(data));
  }, [currentUser, navigate]);

  const grandTotal = bookingData ? bookingData.hallPrice + bookingData.snacksTotal : 0;

  const handlePayment = async () => {
    if (!bookingData || !currentUser) return;

    const bookingId = await addBooking({
      ...bookingData,
      grandTotal,
      userName: currentUser.name,
    });

    sessionStorage.removeItem('bookingData');
    navigate(`/user/confirmation/${bookingId}`);
  };

  if (!bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/user/snacks">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Payment</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="md:col-span-2 space-y-6">
            {/* Movie and Booking Summary */}
            {bookingData.movieImageUrl && (
              <Card className="glass-card border-purple-500/20 overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={bookingData.movieImageUrl}
                      alt={bookingData.movieName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{bookingData.movieName}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>📅 {new Date(bookingData.selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p>⏰ {bookingData.timeSlot}</p>
                      <p>🎭 {bookingData.hallName}</p>
                      <p>👥 {bookingData.groupSize} people</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Snacks Preview */}
            {bookingData.snacks && bookingData.snacks.length > 0 && (
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Selected Snacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {bookingData.snacks.map((snack: any, index: number) => (
                      <div key={index} className="glass-card-light rounded-lg p-3 flex items-center gap-3">
                        {snack.imageUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={snack.imageUrl}
                              alt={snack.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{snack.name}</p>
                          <p className="text-sm font-bold text-red-500">₹{snack.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Select Payment Method</CardTitle>
                <CardDescription className="text-gray-400">Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className={`flex items-center space-x-3 glass-card-light rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'glow-purple border-purple-500/50' : 'border-purple-500/20 hover:border-purple-500/30'}`}>
                      <RadioGroupItem value="card" id="card" className="border-purple-500/50" />
                      <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-pointer">
                        <CreditCard className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">Credit / Debit Card</p>
                          <p className="text-sm text-gray-400">Pay securely with your card</p>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 glass-card-light rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'glow-purple border-purple-500/50' : 'border-purple-500/20 hover:border-purple-500/30'}`}>
                      <RadioGroupItem value="upi" id="upi" className="border-purple-500/50" />
                      <Label htmlFor="upi" className="flex items-center gap-3 flex-1 cursor-pointer">
                        <Smartphone className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">UPI / Mobile Wallet</p>
                          <p className="text-sm text-gray-400">Quick payment via UPI</p>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 glass-card-light rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'glow-purple border-purple-500/50' : 'border-purple-500/20 hover:border-purple-500/30'}`}>
                      <RadioGroupItem value="wallet" id="wallet" className="border-purple-500/50" />
                      <Label htmlFor="wallet" className="flex items-center gap-3 flex-1 cursor-pointer">
                        <Wallet className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">Digital Wallet</p>
                          <p className="text-sm text-gray-400">PayPal, Google Pay, etc.</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="md:col-span-1">
            <Card className="glass-card border-purple-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Booking Summary</CardTitle>
                <CardDescription className="text-gray-400">{bookingData.movieName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-400 mb-1">Hall Details</p>
                    <p className="font-medium text-gray-200">{bookingData.hallName}</p>
                    <p className="text-gray-400">Full Capacity: {bookingData.hallCapacity} seats</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-400 mb-1">Time Slot</p>
                    <p className="font-medium text-gray-200">{bookingData.timeSlot}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-400 mb-1">Your Group Size</p>
                    <p className="font-medium text-gray-200">{bookingData.groupSize} people</p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
                    <p className="text-xs text-yellow-400">Paying for entire hall ({bookingData.hallCapacity} seats)</p>
                  </div>
                </div>

                <div className="border-t border-purple-500/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hall Price:</span>
                    <span className="font-medium text-gray-200">₹{bookingData.hallPrice}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Snacks Total:</span>
                    <span className="font-medium text-gray-200">₹{bookingData.snacksTotal}</span>
                  </div>

                  {bookingData.snacks && bookingData.snacks.length > 0 && (
                    <div className="text-xs text-gray-500 pl-4">
                      {bookingData.snacks.map((snack: any, i: number) => (
                        <div key={i}>• {snack.name}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-purple-500/20 pt-4 flex justify-between text-lg font-bold">
                  <span className="text-white">Grand Total:</span>
                  <span className="text-red-500 glow-red">₹{grandTotal}</span>
                </div>

                <Button className="w-full gradient-button glow-red border-0" size="lg" onClick={handlePayment}>
                  <Check className="mr-2 h-5 w-5" />
                  Pay ₹{grandTotal}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
