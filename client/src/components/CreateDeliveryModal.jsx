import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deliveriesAPI, productsAPI, warehousesAPI } from '@/services/api';
import toast from 'react-hot-toast';

const CreateDeliveryModal = ({ isOpen, onClose, onSuccess }) => {
  const [customers] = useState([
    'Tech Solutions Inc', 'Retail Chain Co', 'Manufacturing Corp',
    'Distribution Hub Ltd', 'E-commerce Ventures', 'Wholesale Partners'
  ]);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    delivery_date: new Date().toISOString().split('T')[0],
    reference_number: `SO-${Date.now()}`,
    notes: '',
    product_id: '',
    quantity: '',
    warehouse_id: ''
  });

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.customer_name) {
        toast.error('Please select a customer');
        setLoading(false);
        return;
      }
      if (!formData.product_id || !formData.quantity || !formData.warehouse_id) {
        toast.error('Please fill all product details');
        setLoading(false);
        return;
      }

      // Create delivery with product info
      await deliveriesAPI.create(formData);
      toast.success('Delivery created successfully!');

      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customer_name: '',
      delivery_date: new Date().toISOString().split('T')[0],
      reference_number: `SO-${Date.now()}`,
      notes: '',
      product_id: '',
      quantity: '',
      warehouse_id: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Create New Delivery</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <Select
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date *
                </label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <Input
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Product Details</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <Select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
                  <Select
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Delivery'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDeliveryModal;
