import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ArrowLeft, Calendar, Clock, Save, RefreshCw } from 'lucide-react';
import { Label } from '@/app/components/ui/label';

export default function ManageTimeSlots() {
  const { currentUser, operatingHours, updateOperatingHours, initializeWeeklySchedule } = useApp();
  const navigate = useNavigate();
  
  const [weeklySchedule, setWeeklySchedule] = useState<Array<{
    date: string;
    dayName: string;
    startTime: string;
    endTime: string;
  }>>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Initialize schedule if empty
    if (operatingHours.length === 0) {
      initializeWeeklySchedule();
    }
  }, [initializeWeeklySchedule, operatingHours.length]);

  useEffect(() => {
    // Build weekly schedule from operating hours
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = daysOfWeek[currentDate.getDay()];
      
      const hours = operatingHours.find(h => h.date === dateStr);
      schedule.push({
        date: dateStr,
        dayName,
        startTime: hours?.startTime || '10:00 AM',
        endTime: hours?.endTime || '11:00 PM',
      });
    }
    
    setWeeklySchedule(schedule);
  }, [operatingHours]);

  const handleTimeChange = (date: string, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prevSchedule =>
      prevSchedule.map(day =>
        day.date === date ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveAll = () => {
    weeklySchedule.forEach(day => {
      updateOperatingHours(day.date, day.startTime, day.endTime);
    });
    alert('Operating hours updated successfully!');
  };

  const handleResetToDefaults = () => {
    initializeWeeklySchedule();
    alert('Schedule reset to default operating hours (10:00 AM - 11:00 PM)');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Time options for dropdown (in 30-minute intervals)
  const timeOptions = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
    '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="hover:bg-purple-500/10 hover:text-purple-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Manage Operating Hours
            </h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <Card className="glass-card border-purple-500/30 mb-6">
          <CardHeader className="p-[24px]">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Weekly Schedule Configuration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Set operating hours for each day. Users can only book within these times for up to 1 week ahead.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleSaveAll}
            className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 gap-4">
          {weeklySchedule.map((day, index) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <Card
                key={day.date}
                className={`glass-card ${
                  isToday 
                    ? 'border-red-500/50 glow-red' 
                    : 'border-purple-500/30'
                } transition-all`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Date Info */}
                    <div className="flex-shrink-0 md:w-48">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                          <Calendar className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            {day.dayName}
                            {isToday && (
                              <span className="text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-300">
                                Today
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">{formatDate(day.date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Time Controls */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Time */}
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          Opening Time
                        </Label>
                        <select
                          value={day.startTime}
                          onChange={(e) => handleTimeChange(day.date, 'startTime', e.target.value)}
                          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:border-purple-500/50 transition-all"
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time} className="bg-[#1a1a1a]">
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* End Time */}
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-400" />
                          Closing Time
                        </Label>
                        <select
                          value={day.endTime}
                          onChange={(e) => handleTimeChange(day.date, 'endTime', e.target.value)}
                          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:border-purple-500/50 transition-all"
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time} className="bg-[#1a1a1a]">
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Duration Display */}
                    <div className="md:w-32 flex-shrink-0">
                      <div className="text-center bg-gradient-to-br from-purple-500/10 to-red-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Duration</p>
                        <p className="text-lg font-semibold text-purple-300">
                          {calculateDuration(day.startTime, day.endTime)} hrs
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Text */}
        <Card className="glass-card border-purple-500/30 mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Operating hours apply to all movie showtimes for that day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Time slots are automatically calculated based on movie duration + 30-minute buffer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Users can only book shows within the 1-week schedule you configure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Current day's hours are displayed to users on the home page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Remember to update the schedule weekly to maintain the 7-day booking window</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Helper function to calculate duration in hours
function calculateDuration(startTime: string, endTime: string): number {
  const convertTo24Hour = (time12: string): number => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours + minutes / 60;
  };

  const start = convertTo24Hour(startTime);
  let end = convertTo24Hour(endTime);
  
  // Handle overnight scenarios (e.g., 10 PM to 2 AM)
  if (end < start) {
    end += 24;
  }
  
  return Math.round((end - start) * 10) / 10; // Round to 1 decimal place
}
