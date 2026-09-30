import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Film } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const { login, authError } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent, isAdmin: boolean) => {
    e.preventDefault();
    if (await login(email, password, isAdmin)) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 vignette">
      <Card className="w-full max-w-md glass-card border-purple-500/30 glow-purple">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-red-500 to-purple-600 p-3 rounded-full glow-red">
              <Film className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Minema Booking</CardTitle>
          <CardDescription className="text-gray-400">Book entire movie halls for your group</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 glass-card-light border-purple-500/30">
              <TabsTrigger value="user" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-gray-400">User Login</TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-gray-400">Admin Login</TabsTrigger>
            </TabsList>
            
            {authError && <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{authError}</p>}
            <TabsContent value="user">
              <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-gray-300">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password" className="text-gray-300">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>
                <Button type="submit" className="w-full gradient-button glow-red border-0">
                  Login as User
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-400">Don't have an account?{' '}</span>
                <Link to="/signup" className="text-red-500 hover:text-red-400 hover:underline">
                  Sign up
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={(e) => handleLogin(e, true)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-gray-300">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@minema.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-gray-300">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 glow-purple border-0 text-white">
                  Login as Admin
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-gray-500">
                Demo: Use any email and password
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
