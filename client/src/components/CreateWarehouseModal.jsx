import { useState } from 'react';
import { X, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { warehousesAPI } from '@/services/api';
import toast from 'react-hot-toast';

const CreateWarehouseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '10000'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter warehouse name');
        setLoading(false);
        return;
      }
      if (!formData.location.trim()) {
        toast.error('Please enter warehouse location');
        setLoading(false);
        return;
      }
      if (!formData.capacity || formData.capacity <= 0) {
        toast.error('Please enter valid capacity');
        setLoading(false);
        return;
      }

      await warehousesAPI.create(formData);
      toast.success('Warehouse created successfully!');

      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to create warehouse');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      location: '',
      capacity: '10000'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Add New Warehouse</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Warehouse Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Name *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="e.g., Main Warehouse, Warehouse A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="e.g., New York, NY / Building 5, Floor 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the physical location or address of the warehouse
              </p>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Capacity *
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="10000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of units that can be stored
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once created, the warehouse will be active by default. 
                You can manage locations within this warehouse from the warehouse detail page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Warehouse'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWarehouseModal;
