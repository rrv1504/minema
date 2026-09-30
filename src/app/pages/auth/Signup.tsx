import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Film } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { signup, authError } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await signup(name, email, phone, password)) {
      navigate('/user/home');
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
          <CardTitle className="text-2xl text-white">Join Minema</CardTitle>
          <CardDescription className="text-gray-400">Create your account to start booking movie halls</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{authError}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-card-light border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>
            <Button type="submit" className="w-full gradient-button glow-red border-0">
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-400">Already have an account?{' '}</span>
            <Link to="/" className="text-red-500 hover:text-red-400 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
