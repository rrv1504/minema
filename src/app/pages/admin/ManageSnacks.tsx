import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { ArrowLeft, Popcorn, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export default function ManageSnacks() {
  const { currentUser, snacks, addSnack, updateSnack, deleteSnack } = useApp();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnack, setEditingSnack] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '', isActive: true });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSnack) {
      updateSnack(editingSnack.id, { ...formData, price: parseFloat(formData.price) });
    } else {
      addSnack({ ...formData, price: parseFloat(formData.price) });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', imageUrl: '', isActive: true });
    setEditingSnack(null);
  };

  const handleEdit = (snack: any) => {
    setEditingSnack(snack);
    setFormData({ name: snack.name, price: snack.price.toString(), imageUrl: snack.imageUrl, isActive: snack.isActive });
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
                  <Popcorn className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Manage Snacks</h1>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"><Plus className="h-4 w-4 mr-2" />Add Snack</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md glass-card border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingSnack ? 'Edit Snack' : 'Add New Snack'}</DialogTitle>
                  <DialogDescription className="text-gray-400">{editingSnack ? 'Update snack details' : 'Add a new snack'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Snack Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">{editingSnack ? 'Update' : 'Add'} Snack</Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {snacks.map(snack => (
            <Card key={snack.id} className="overflow-hidden glass-card border-purple-500/20 hover:border-purple-500/40 hover:glow-purple transition-all">
              <div className="aspect-square w-full overflow-hidden bg-gray-900">
                <img
                  src={snack.imageUrl}
                  alt={snack.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{snack.name}</h3>
                    <p className="text-2xl font-bold text-red-500 mt-1">₹{snack.price}</p>
                  </div>
                  <Badge variant={snack.isActive ? 'default' : 'secondary'} className={snack.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                    {snack.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-gray-300" onClick={() => handleEdit(snack)}>
                    <Pencil className="h-3 w-3 mr-1" />Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-gray-300" onClick={() => updateSnack(snack.id, { isActive: !snack.isActive })}>
                    {snack.isActive ? 'Disable' : 'Enable'}
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