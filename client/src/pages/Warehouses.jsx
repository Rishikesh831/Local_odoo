import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { warehousesAPI } from '@/services/api';
import CreateWarehouseModal from '@/components/CreateWarehouseModal';

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseClick = (warehouseId) => {
    navigate(`/warehouses/${warehouseId}`);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);
  const totalQuantity = warehouses.reduce((sum, w) => sum + parseFloat(w.total_quantity || 0), 0);
  const totalProducts = warehouses.reduce((sum, w) => sum + parseInt(w.product_count || 0), 0);
  const activeWarehouses = warehouses.filter(w => w.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading warehouses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--accent-red)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-500 mt-1">Manage warehouse locations and inventory</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Warehouses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{warehouses.length}</p>
              <Badge variant="success" className="mt-2">{activeWarehouses} Active</Badge>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Capacity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCapacity.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">units</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(totalQuantity).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">units stored</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Unique Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
              <p className="text-sm text-gray-500 mt-2">across all warehouses</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search warehouses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => {
          const capacityUsed = warehouse.capacity > 0
            ? Math.round((parseFloat(warehouse.total_quantity) / warehouse.capacity) * 100)
            : 0;

          return (
            <Card
              key={warehouse.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWarehouseClick(warehouse.id)}
            >
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {warehouse.location}
                    </div>
                  </div>
                  {warehouse.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Capacity Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Capacity Used</span>
                      <span className="font-semibold">{capacityUsed}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          capacityUsed > 80 ? 'bg-red-500' :
                          capacityUsed > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(capacityUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-500">Products</p>
                      <p className="text-lg font-bold text-gray-900">{warehouse.product_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Stock</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(parseFloat(warehouse.total_quantity || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(warehouse.capacity || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.max(0, warehouse.capacity - parseFloat(warehouse.total_quantity || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No warehouses found matching your search.</p>
        </div>
      )}

      {/* Create Warehouse Modal */}
      <CreateWarehouseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchWarehouses}
      />
    </div>
  );
};

export default Warehouses;
