import { useState, useEffect } from 'react';
import { X, Package, MapPin, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productsAPI, warehousesAPI } from '@/services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreateStockModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    location_id: '',
    qty: ''
  });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.warehouse_id) {
      fetchLocations(formData.warehouse_id);
    } else {
      setLocations([]);
      setFormData(prev => ({ ...prev, location_id: '' }));
    }
  }, [formData.warehouse_id]);

  const fetchData = async () => {
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productsAPI.getAll(),
        warehousesAPI.getAll()
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    }
  };

  const fetchLocations = async (warehouseId) => {
    try {
      // Fetch locations for the selected warehouse
      const response = await axios.get(`http://localhost:5000/api/stock/locations/${warehouseId}`);
      setLocations(response.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocations([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.product_id) {
        toast.error('Please select a product');
        setLoading(false);
        return;
      }
      if (!formData.warehouse_id) {
        toast.error('Please select a warehouse');
        setLoading(false);
        return;
      }
      if (!formData.location_id) {
        toast.error('Please select a location');
        setLoading(false);
        return;
      }
      if (!formData.qty || formData.qty <= 0) {
        toast.error('Please enter valid quantity');
        setLoading(false);
        return;
      }

      // Add stock via API
      await axios.post('http://localhost:5000/api/stock', formData);
      toast.success('Stock added successfully!');

      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product_id: '',
      warehouse_id: '',
      location_id: '',
      qty: ''
    });
    setLocations([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Add Stock</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select
                  className="pl-10"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      [{product.sku}] {product.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select
                  className="pl-10"
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select
                  className="pl-10"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  required
                  disabled={!formData.warehouse_id}
                >
                  <option value="">
                    {formData.warehouse_id ? 'Select location' : 'Select warehouse first'}
                  </option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name || location.code} {location.name && `(${location.code})`}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose the specific location within the warehouse
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter quantity"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of units to add to stock
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> This will add stock directly to the system. 
                For tracked inventory movements, use Receipts instead.
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
                {loading ? 'Adding...' : 'Add Stock'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStockModal;
