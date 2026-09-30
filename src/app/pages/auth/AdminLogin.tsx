import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authError } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(email, password, true)) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 vignette">
      <Card className="w-full max-w-md glass-card border-purple-500/30 glow-purple">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-full glow-purple">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Minema - Admin Login</CardTitle>
          <CardDescription className="text-gray-400">Access the Minema administrative dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-500">
              Demo: Use any email and password
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-2 text-gray-500">Or</span>
              </div>
            </div>
            <div className="text-center text-sm">
              <span className="text-gray-400">Regular user?{' '}</span>
              <Link to="/" className="text-red-500 hover:text-red-400 hover:underline">
                User Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
