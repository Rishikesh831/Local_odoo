import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { warehousesAPI } from '@/services/api';

const WarehouseDetail = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // products, locations, operations

  useEffect(() => {
    fetchWarehouseDetails();
  }, [warehouseId]);

  const fetchWarehouseDetails = async () => {
    try {
      setLoading(true);
      const response = await warehousesAPI.getById(warehouseId);
      setWarehouse(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch warehouse details');
      console.error('Error fetching warehouse:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading warehouse details...</p>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--accent-red)' }}>{error || 'Warehouse not found'}</p>
      </div>
    );
  }

  const getStockStatus = (product) => {
    const qty = parseFloat(product.quantity || 0);
    const reorderLevel = product.reorder_level || 0;
    
    if (qty === 0) return { variant: 'destructive', text: 'Out of Stock' };
    if (qty <= reorderLevel) return { variant: 'warning', text: 'Low Stock' };
    return { variant: 'success', text: 'In Stock' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/warehouses')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
              {warehouse.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              <p>{warehouse.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{warehouse.stats.total_products}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.round(warehouse.stats.total_quantity).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Capacity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {warehouse.capacity.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.max(0, warehouse.capacity - warehouse.stats.total_quantity).toLocaleString()} available
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              warehouse.stats.capacity_used > 80 ? 'bg-red-100' : 
              warehouse.stats.capacity_used > 60 ? 'bg-yellow-100' : 
              'bg-green-100'
            }`}>
              <AlertCircle className={`w-6 h-6 ${
                warehouse.stats.capacity_used > 80 ? 'text-red-600' : 
                warehouse.stats.capacity_used > 60 ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Capacity Used</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{warehouse.stats.capacity_used}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    warehouse.stats.capacity_used > 80 ? 'bg-red-500' :
                    warehouse.stats.capacity_used > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(warehouse.stats.capacity_used, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'products'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products ({warehouse.products.length})
            {activeTab === 'products' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'locations'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations ({warehouse.locations.length})
            {activeTab === 'locations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'operations'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Operations
            {activeTab === 'operations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Products in Warehouse</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">SKU</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Quantity</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Locations</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouse.products.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => navigate('/stock')}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {product.name}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{product.category || 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className="font-semibold">{Math.round(parseFloat(product.quantity))}</span>
                          <span className="text-gray-500 text-sm"> {product.uom}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{product.location_count} locations</td>
                        <td className="py-4 px-6">
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/stock`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'locations' && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Location Code</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Stock Items</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouse.locations.map((location) => (
                    <tr key={location.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{location.code}</code>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{location.name}</td>
                      <td className="py-4 px-6 text-gray-600">{location.stock_items} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Receipts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {warehouse.recent_receipts.length === 0 ? (
                  <p className="p-6 text-gray-500 text-center">No recent receipts</p>
                ) : (
                  warehouse.recent_receipts.map((receipt) => (
                    <Link
                      key={receipt.id}
                      to={`/receipts/${receipt.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            WH/IN/{String(receipt.id).padStart(4, '0')}
                          </p>
                          <p className="text-sm text-gray-500">{receipt.vendor}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(receipt.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={receipt.status === 'done' ? 'success' : 'draft'}>
                          {receipt.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {warehouse.recent_deliveries.length === 0 ? (
                  <p className="p-6 text-gray-500 text-center">No recent deliveries</p>
                ) : (
                  warehouse.recent_deliveries.map((delivery) => (
                    <Link
                      key={delivery.id}
                      to={`/deliveries/${delivery.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            WH/OUT/{String(delivery.id).padStart(4, '0')}
                          </p>
                          <p className="text-sm text-gray-500">{delivery.customer}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(delivery.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={delivery.status === 'done' ? 'success' : 'draft'}>
                          {delivery.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetail;
