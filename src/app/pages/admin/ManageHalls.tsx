import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { ArrowLeft, LayoutDashboard, Plus, Pencil, Home } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export default function ManageHalls() {
  const { currentUser, halls, addHall, updateHall, deleteHall } = useApp();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', capacity: '', imageUrl: '', isActive: true });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHall) {
      updateHall(editingHall.id, { ...formData, capacity: parseInt(formData.capacity) });
    } else {
      addHall({ ...formData, capacity: parseInt(formData.capacity) });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', capacity: '', imageUrl: '', isActive: true });
    setEditingHall(null);
  };

  const handleEdit = (hall: any) => {
    setEditingHall(hall);
    setFormData({ name: hall.name, capacity: hall.capacity.toString(), imageUrl: hall.imageUrl, isActive: hall.isActive });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="glass-card border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10"><ArrowLeft className="h-5 w-5 text-gray-300" /></Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2 rounded-lg glow-red">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Manage Halls</h1>
              </div>
            </div>
            <Link to="/admin/hall/new">
              <Button className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Hall
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map(hall => (
            <Card key={hall.id} className="overflow-hidden glass-card border-purple-500/20 hover:border-purple-500/40 hover:glow-purple transition-all">
              <Link to={`/admin/hall/${hall.id}`} className="block">
                <div className="aspect-video w-full overflow-hidden bg-gray-900 cursor-pointer">
                  <img
                    src={hall.imageUrl}
                    alt={hall.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <CardContent className="p-6">
                <Link to={`/admin/hall/${hall.id}`} className="block hover:opacity-80 transition-opacity mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{hall.name}</h3>
                      <p className="text-gray-400">Capacity: {hall.capacity}</p>
                    </div>
                    <Badge variant={hall.isActive ? 'default' : 'secondary'} className={hall.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                      {hall.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link to={`/admin/hall/${hall.id}/edit`} className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-gray-300"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-gray-300" onClick={() => updateHall(hall.id, { isActive: !hall.isActive })}>
                    {hall.isActive ? 'Disable' : 'Enable'}
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